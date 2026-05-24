import html
import uuid
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.database import get_db
from app.excel_templates import export_imported_files_zip
from app.models import FileAsset, PackingItem, PackingOrder
from app.schemas import ExcelExportRequest, ExcelExportResponse, ExcelImportResponse, HistoryFileExportRequest
from app.services import save_upload


router = APIRouter(prefix="/excel", tags=["excel"])
settings = get_settings()


def _file_stem(filename: str) -> str:
    stem = Path(filename).stem.strip()
    return stem or "Excel 导入客户"


def _html_cell(value: object) -> str:
    return html.escape("" if value is None else str(value))


def _export_html(payload: ExcelExportRequest) -> str:
    rows = []
    for record in payload.records:
        for index, item in enumerate(record.rows, start=1):
            rows.append(
                "<tr>"
                f"<td>{_html_cell(record.id)}</td>"
                f"<td>{_html_cell(record.date)}</td>"
                f"<td>{_html_cell(record.customer)}</td>"
                f"<td>{_html_cell(record.status)}</td>"
                f"<td>{index}</td>"
                f"<td>{_html_cell(item.itemName)}</td>"
                f"<td>{_html_cell(item.description)}</td>"
                f"<td>{_html_cell(item.quantity)}</td>"
                f"<td>{_html_cell(item.unit)}</td>"
                f"<td>{_html_cell(item.unitPrice)}</td>"
                f"<td>{_html_cell(item.totalPrice)}</td>"
                f"<td>{_html_cell(item.qtyPerCarton)}</td>"
                f"<td>{_html_cell(item.cartonCount)}</td>"
                f"<td>{_html_cell(item.grossWeightCtn)}</td>"
                f"<td>{_html_cell(item.cbm)}</td>"
                f"<td>{_html_cell(item.totalGrossWeight)}</td>"
                f"<td>{_html_cell(item.measureCm)}</td>"
                f"<td>{_html_cell(item.totalCbm)}</td>"
                "</tr>"
            )
    return (
        "<html><head><meta charset=\"UTF-8\" /></head><body>"
        "<table border=\"1\"><thead><tr>"
        "<th>单据编号</th><th>日期</th><th>客户</th><th>状态</th><th>行号</th>"
        "<th>品名</th><th>产品描述</th><th>数量</th><th>单位</th><th>单价</th><th>总价</th>"
        "<th>数量/箱</th><th>箱数</th><th>毛重/箱</th><th>体积</th><th>总毛重</th><th>箱子规格</th><th>总体积</th>"
        "</tr></thead><tbody>"
        + "".join(rows)
        + "</tbody></table></body></html>"
    )


@router.post("/import-history", response_model=ExcelImportResponse)
def import_history_excels(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> ExcelImportResponse:
    imported = []
    today = date.today()

    for upload in files:
        suffix = Path(upload.filename or "").suffix.lower()
        if suffix not in {".xls", ".xlsx"}:
            raise HTTPException(status_code=400, detail=f"Unsupported Excel file: {upload.filename}")

        asset = save_upload(db=db, file=upload, biz_type="packing_order", file_type="excel_imports")
        customer_name = _file_stem(asset.original_name)
        order_no = f"IMP{today:%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"
        order = PackingOrder(
            order_no=order_no,
            customer_name=customer_name,
            order_date=today,
            status="draft",
            items=[
                PackingItem(
                    row_index=1,
                    item_name=f"待核对：{customer_name}",
                    description=f"已接收 Excel 文件 {asset.original_name}，文件已保存到服务器，真实单元格解析待接入。",
                    quantity=1,
                    unit="file",
                    total_price=0,
                )
            ],
        )
        db.add(order)
        db.flush()
        asset.biz_id = order.id
        db.commit()
        db.refresh(asset)
        db.refresh(order)
        order = db.scalar(select(PackingOrder).where(PackingOrder.id == order.id).options(selectinload(PackingOrder.items)))
        imported.append({"file": asset, "order": order})

    return ExcelImportResponse(imported=imported)


@router.post("/export-history", response_model=ExcelExportResponse)
def export_history_excel(payload: ExcelExportRequest, db: Session = Depends(get_db)) -> ExcelExportResponse:
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records to export")

    export_dir = settings.upload_root / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    filename = f"packing-history-{date.today():%Y-%m-%d}-{uuid.uuid4().hex[:8]}.xls"
    storage_path = export_dir / filename
    storage_path.write_text(_export_html(payload), encoding="utf-8")

    asset = FileAsset(
        biz_type="packing_order",
        biz_id=None,
        file_type="exports",
        original_name=filename,
        storage_path=str(storage_path),
        mime_type="application/vnd.ms-excel",
        file_size=storage_path.stat().st_size,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return ExcelExportResponse(file=asset, download_url=f"/api/excel/download/{asset.id}")


@router.post("/export-history-files", response_model=ExcelExportResponse)
def export_history_files(payload: HistoryFileExportRequest, db: Session = Depends(get_db)) -> ExcelExportResponse:
    if not payload.file_ids:
        raise HTTPException(status_code=400, detail="No files selected")

    assets = list(db.scalars(select(FileAsset).where(FileAsset.id.in_(payload.file_ids))))
    found_ids = {asset.id for asset in assets}
    missing = [file_id for file_id in payload.file_ids if file_id not in found_ids]
    if missing:
        raise HTTPException(status_code=404, detail="Some Excel files were not found")

    invalid = [asset.original_name for asset in assets if asset.file_type != "excel_imports"]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Only imported Excel files can be packed: {', '.join(invalid)}")

    asset, download_url = export_imported_files_zip(db, assets)
    return ExcelExportResponse(file=asset, download_url=download_url)


@router.get("/download/{file_id}")
def download_excel(file_id: uuid.UUID, db: Session = Depends(get_db)) -> FileResponse:
    asset = db.get(FileAsset, file_id)
    if not asset or asset.file_type not in {"exports", "excel_imports"}:
        raise HTTPException(status_code=404, detail="Excel file not found")

    path = Path(asset.storage_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Stored file missing")

    return FileResponse(path, media_type=asset.mime_type or "application/octet-stream", filename=asset.original_name)
