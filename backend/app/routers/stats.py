from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PackingItem, PackingOrder
from app.schemas import StatsRequest, StatsResponse, StatsSummary


router = APIRouter(prefix="/stats", tags=["stats"])


@router.post("/orders", response_model=StatsResponse)
def order_stats(payload: StatsRequest, db: Session = Depends(get_db)) -> StatsResponse:
    stmt = (
        select(PackingItem)
        .join(PackingOrder, PackingOrder.id == PackingItem.order_id)
        .where(PackingOrder.order_date >= payload.start_date, PackingOrder.order_date <= payload.end_date)
        .order_by(PackingOrder.order_date.desc(), PackingItem.row_index.asc())
    )
    if payload.customer_ids:
        stmt = stmt.where(PackingOrder.customer_id.in_(payload.customer_ids))
    if payload.item_name:
        stmt = stmt.where(PackingItem.item_name.ilike(f"%{payload.item_name}%"))
    if payload.description:
        stmt = stmt.where(PackingItem.description.ilike(f"%{payload.description}%"))

    rows = list(db.scalars(stmt))

    def total(attr: str) -> Decimal:
        return sum((getattr(item, attr) or Decimal("0")) for item in rows)

    return StatsResponse(
        detail_rows=rows,
        summary=StatsSummary(
            detail_count=len(rows),
            quantity_total=total("quantity"),
            amount_total=total("total_price"),
            carton_total=total("carton_count"),
            gross_weight_total=total("total_gross_weight"),
            cbm_total=total("total_cbm"),
        ),
    )
