import html
import uuid
import zipfile
from datetime import date
from decimal import Decimal
from pathlib import Path

import xlwt
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import FileAsset, PackingOrder


settings = get_settings()
TEMPLATE_PATH = Path(__file__).resolve().parents[1] / "templates" / "blank_packing_list.xls"


def _text(value: object) -> str:
    return "" if value is None else str(value)


def _money(value: object) -> str:
    if value in (None, ""):
        return ""
    try:
        return f"{Decimal(str(value)):,.2f}"
    except Exception:
        return _text(value)


def _num(value: object) -> float | str:
    if value in (None, ""):
        return ""
    try:
        return float(Decimal(str(value)))
    except Exception:
        return _text(value)


def _style(
    *,
    bold: bool = False,
    font_height: int = 220,
    align: str = "center",
    valign: str = "center",
    border: bool = False,
    wrap: bool = False,
    num_format: str | None = None,
) -> xlwt.XFStyle:
    style = xlwt.XFStyle()
    font = xlwt.Font()
    font.name = "Arial"
    font.bold = bold
    font.height = font_height
    style.font = font

    alignment = xlwt.Alignment()
    alignment.horz = {
        "left": xlwt.Alignment.HORZ_LEFT,
        "center": xlwt.Alignment.HORZ_CENTER,
        "right": xlwt.Alignment.HORZ_RIGHT,
    }[align]
    alignment.vert = {
        "top": xlwt.Alignment.VERT_TOP,
        "center": xlwt.Alignment.VERT_CENTER,
    }[valign]
    alignment.wrap = 1 if wrap else 0
    style.alignment = alignment

    if border:
        borders = xlwt.Borders()
        borders.left = borders.right = borders.top = borders.bottom = xlwt.Borders.THIN
        style.borders = borders
    if num_format:
        style.num_format_str = num_format
    return style


TITLE_STYLE = _style(bold=True, font_height=320)
SUBTITLE_STYLE = _style(font_height=220)
ADDRESS_STYLE = _style(font_height=180, wrap=True)
INFO_STYLE = _style(font_height=200, align="left", border=True)
HEAD_STYLE = _style(bold=True, font_height=190, border=True, wrap=True)
CELL_STYLE = _style(font_height=190, border=True, wrap=True)
NUM_STYLE = _style(font_height=190, border=True, num_format="0.00")
MONEY_STYLE = _style(font_height=190, border=True, num_format="¥#,##0.00")
TOTAL_STYLE = _style(bold=True, font_height=200, border=True, wrap=True)
FOOT_STYLE = _style(font_height=200, align="left", border=True)


def _write_fixed_header(sheet: xlwt.Worksheet, order: PackingOrder) -> None:
    for col, width in enumerate([22, 24, 16, 10, 10, 12, 12, 12, 10, 12, 10, 14, 18, 12]):
        sheet.col(col).width = width * 256

    sheet.write_merge(0, 0, 0, 13, "广  州  宝  捷  汽  车  用  品", TITLE_STYLE)
    sheet.write_merge(1, 1, 0, 13, "Guangzhou Baojie Auto Accessories Factory", SUBTITLE_STYLE)
    sheet.write_merge(
        2,
        2,
        0,
        13,
        "地址:广州市越秀区恒福路155号益友(国际)汽配用品展贸中心富一楼GC023 "
        "Add:GC023 Floor Yiyou International Auto Accessories Trade Center NO.155 Hengfu Road,Yuexiu District.GuangZhou.China. "
        "E-mail:gzbj1698@163.com QQ:1436367790 电话/Tel:020-62229272传真/Fax:020-62229272 Huang Cai Ling Mob:13622857278",
        ADDRESS_STYLE,
    )
    sheet.row(2).height_mismatch = True
    sheet.row(2).height = 1050
    sheet.write_merge(
        3,
        3,
        0,
        13,
        f"客户Customer：{order.customer_name}                                                                   "
        f"Invoice & Packing List                                               日期Date:{order.order_date:%Y-%m-%d}",
        INFO_STYLE,
    )

    en_headers = [
        "ITEM",
        "DESCRIPTION",
        "PHOTO",
        "QTY",
        "UNIT",
        "U/P\n(RMB)",
        "T/P\n(RMB)",
        "QTY /ctn",
        "CTN",
        "G.W/ctn",
        "CBM",
        "TOTAL \nG.W(kg)",
        "MEAS (cm)",
        "TOTAL \nCBM ",
    ]
    zh_headers = ["品名", "产品描述", "图片", "数量", "单位", "单价", "总价", "数量/箱", "箱数", "毛重/箱", "体积", "总毛重", "箱子规格", "总体积"]
    for col, value in enumerate(en_headers):
        sheet.write(4, col, value, HEAD_STYLE)
        sheet.write(5, col, zh_headers[col], HEAD_STYLE)


def _write_order_sheet(sheet: xlwt.Worksheet, order: PackingOrder) -> None:
    _write_fixed_header(sheet, order)
    start_row = 6
    rows = list(order.items) or []
    detail_count = max(len(rows), 6)
    for offset in range(detail_count):
        row_index = start_row + offset
        item = rows[offset] if offset < len(rows) else None
        values = [
            _text(getattr(item, "item_name", "")),
            _text(getattr(item, "description", "")),
            "",
            _num(getattr(item, "quantity", "")),
            _text(getattr(item, "unit", "")),
            _num(getattr(item, "unit_price", "")),
            _num(getattr(item, "total_price", "")),
            _num(getattr(item, "qty_per_carton", "")),
            _num(getattr(item, "carton_count", "")),
            _num(getattr(item, "gross_weight_ctn", "")),
            _num(getattr(item, "cbm", "")),
            _num(getattr(item, "total_gross_weight", "")),
            _text(getattr(item, "measure_cm", "")),
            _num(getattr(item, "total_cbm", "")),
        ]
        for col, value in enumerate(values):
            sheet.write(row_index, col, value, MONEY_STYLE if col in {5, 6} else NUM_STYLE if col in {3, 7, 8, 9, 10, 11, 13} else CELL_STYLE)

    total_row = start_row + detail_count
    sheet.write_merge(total_row, total_row, 0, 2, "TOTAL", TOTAL_STYLE)
    sheet.write(total_row, 3, xlwt.Formula(f"SUM(D{start_row + 1}:D{total_row})"), TOTAL_STYLE)
    sheet.write(total_row, 4, "", TOTAL_STYLE)
    sheet.write(total_row, 5, "", TOTAL_STYLE)
    sheet.write(total_row, 6, xlwt.Formula(f"SUM(G{start_row + 1}:G{total_row})"), MONEY_STYLE)
    sheet.write(total_row, 7, "", TOTAL_STYLE)
    sheet.write(total_row, 8, xlwt.Formula(f"SUM(I{start_row + 1}:I{total_row})"), TOTAL_STYLE)
    sheet.write(total_row, 9, "", TOTAL_STYLE)
    sheet.write(total_row, 10, "", TOTAL_STYLE)
    sheet.write(total_row, 11, xlwt.Formula(f"SUM(L{start_row + 1}:L{total_row})"), TOTAL_STYLE)
    sheet.write(total_row, 12, "", TOTAL_STYLE)
    sheet.write(total_row, 13, xlwt.Formula(f"SUM(N{start_row + 1}:N{total_row})"), TOTAL_STYLE)

    foot_row = total_row + 1
    sheet.write_merge(foot_row, foot_row, 0, 2, "DEPOTSIT:", FOOT_STYLE)
    sheet.write_merge(foot_row, foot_row, 3, 13, _money(order.deposit), FOOT_STYLE)
    sheet.write_merge(foot_row + 1, foot_row + 1, 0, 2, "BLANCE:", FOOT_STYLE)
    sheet.write_merge(foot_row + 1, foot_row + 1, 3, 13, _money(order.balance), FOOT_STYLE)
    sheet.write_merge(foot_row + 2, foot_row + 2, 0, 2, "银行账号：", FOOT_STYLE)
    sheet.write_merge(foot_row + 2, foot_row + 2, 3, 5, _text(order.bank_account), FOOT_STYLE)


def render_order_preview(order: PackingOrder) -> str:
    headers = ["品名", "产品描述", "图片", "数量", "单位", "单价", "总价", "数量/箱", "箱数", "毛重/箱", "体积", "总毛重", "箱子规格", "总体积"]
    rows = []
    for item in order.items:
        values = [
            item.item_name,
            item.description,
            "",
            item.quantity,
            item.unit,
            item.unit_price,
            item.total_price,
            item.qty_per_carton,
            item.carton_count,
            item.gross_weight_ctn,
            item.cbm,
            item.total_gross_weight,
            item.measure_cm,
            item.total_cbm,
        ]
        rows.append("<tr>" + "".join(f"<td>{html.escape(_text(value))}</td>" for value in values) + "</tr>")

    return (
        "<section class=\"excel-preview-doc\">"
        "<h2>广 州 宝 捷 汽 车 用 品</h2>"
        "<p>Guangzhou Baojie Auto Accessories Factory</p>"
        f"<div class=\"excel-preview-meta\"><span>客户Customer：{html.escape(order.customer_name)}</span><span>日期Date:{order.order_date:%Y-%m-%d}</span></div>"
        "<table><thead><tr>"
        + "".join(f"<th>{header}</th>" for header in headers)
        + "</tr></thead><tbody>"
        + "".join(rows)
        + "</tbody></table>"
        f"<div class=\"excel-preview-foot\"><span>DEPOTSIT: {html.escape(_money(order.deposit))}</span><span>BLANCE: {html.escape(_money(order.balance))}</span><span>银行账号：{html.escape(_text(order.bank_account))}</span></div>"
        "</section>"
    )


def export_order_to_xls(db: Session, order: PackingOrder) -> tuple[FileAsset, str]:
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Template missing: {TEMPLATE_PATH}")

    export_dir = settings.upload_root / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{order.order_no}-{date.today():%Y-%m-%d}-{uuid.uuid4().hex[:8]}.xls"
    storage_path = export_dir / filename

    workbook = xlwt.Workbook(encoding="utf-8")
    sheet = workbook.add_sheet("Sheet1")
    _write_order_sheet(sheet, order)
    workbook.save(str(storage_path))

    asset = FileAsset(
        biz_type="packing_order",
        biz_id=order.id,
        file_type="exports",
        original_name=filename,
        storage_path=str(storage_path),
        mime_type="application/vnd.ms-excel",
        file_size=storage_path.stat().st_size,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset, f"/api/excel/download/{asset.id}"


def export_imported_files_zip(db: Session, assets: list[FileAsset]) -> tuple[FileAsset, str]:
    export_dir = settings.upload_root / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    filename = f"packing-history-files-{date.today():%Y-%m-%d}-{uuid.uuid4().hex[:8]}.zip"
    storage_path = export_dir / filename

    used_names: dict[str, int] = {}
    with zipfile.ZipFile(storage_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for asset in assets:
            source = Path(asset.storage_path)
            if not source.exists():
                continue
            arcname = asset.original_name
            count = used_names.get(arcname, 0)
            used_names[arcname] = count + 1
            if count:
                stem = Path(arcname).stem
                suffix = Path(arcname).suffix
                arcname = f"{stem}-{count + 1}{suffix}"
            archive.write(source, arcname)

    asset = FileAsset(
        biz_type="packing_order",
        biz_id=None,
        file_type="exports",
        original_name=filename,
        storage_path=str(storage_path),
        mime_type="application/zip",
        file_size=storage_path.stat().st_size,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset, f"/api/excel/download/{asset.id}"
