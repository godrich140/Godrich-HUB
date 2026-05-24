import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.excel_templates import export_order_to_xls, render_order_preview
from app.models import PackingItem, PackingOrder
from app.schemas import ExcelExportResponse, OrderPreviewResponse, PackingOrderCreate, PackingOrderRead, PackingOrderUpdate


router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[PackingOrderRead])
def list_orders(
    keyword: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[PackingOrder]:
    stmt = select(PackingOrder).options(selectinload(PackingOrder.items)).order_by(PackingOrder.order_date.desc())
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.where(PackingOrder.order_no.ilike(like) | PackingOrder.customer_name.ilike(like))
    if start_date:
        stmt = stmt.where(PackingOrder.order_date >= start_date)
    if end_date:
        stmt = stmt.where(PackingOrder.order_date <= end_date)
    return list(db.scalars(stmt))


@router.post("", response_model=PackingOrderRead)
def create_order(payload: PackingOrderCreate, db: Session = Depends(get_db)) -> PackingOrder:
    order_data = payload.model_dump(exclude={"items"})
    order = PackingOrder(**order_data)
    order.items = [PackingItem(**item.model_dump()) for item in payload.items]
    db.add(order)
    db.commit()
    db.refresh(order)
    return get_order(order.id, db)


@router.get("/{order_id}", response_model=PackingOrderRead)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> PackingOrder:
    order = db.scalar(select(PackingOrder).where(PackingOrder.id == order_id).options(selectinload(PackingOrder.items)))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=PackingOrderRead)
def update_order(order_id: uuid.UUID, payload: PackingOrderUpdate, db: Session = Depends(get_db)) -> PackingOrder:
    order = db.scalar(select(PackingOrder).where(PackingOrder.id == order_id).options(selectinload(PackingOrder.items)))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    data = payload.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in data.items():
        setattr(order, key, value)

    if payload.items is not None:
        order.items.clear()
        order.items.extend(PackingItem(**item.model_dump()) for item in payload.items)

    db.commit()
    return get_order(order.id, db)


@router.post("/{order_id}/preview", response_model=OrderPreviewResponse)
def preview_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> OrderPreviewResponse:
    order = get_order(order_id, db)
    return OrderPreviewResponse(html=render_order_preview(order))


@router.post("/{order_id}/export-excel", response_model=ExcelExportResponse)
def export_order_excel(order_id: uuid.UUID, db: Session = Depends(get_db)) -> ExcelExportResponse:
    order = get_order(order_id, db)
    asset, download_url = export_order_to_xls(db, order)
    return ExcelExportResponse(file=asset, download_url=download_url)
