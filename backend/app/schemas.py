import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CustomerBase(BaseModel):
    customer_name: str = Field(min_length=1, max_length=160)
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    remark: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    remark: str | None = None


class CustomerRead(CustomerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PackingItemBase(BaseModel):
    row_index: int
    item_name: str | None = None
    description: str | None = None
    photo_file_id: uuid.UUID | None = None
    quantity: Decimal | None = None
    unit: str | None = None
    unit_price: Decimal | None = None
    total_price: Decimal | None = None
    qty_per_carton: Decimal | None = None
    carton_count: Decimal | None = None
    gross_weight_ctn: Decimal | None = None
    cbm: Decimal | None = None
    total_gross_weight: Decimal | None = None
    measure_cm: str | None = None
    total_cbm: Decimal | None = None
    merge_group_id: str | None = None


class PackingItemCreate(PackingItemBase):
    pass


class PackingItemRead(PackingItemBase):
    id: uuid.UUID
    order_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PackingOrderBase(BaseModel):
    order_no: str = Field(min_length=1, max_length=80)
    customer_id: uuid.UUID | None = None
    customer_name: str = Field(min_length=1, max_length=160)
    order_date: date
    status: str = "draft"
    deposit: Decimal | None = None
    balance: Decimal | None = None
    bank_account: str | None = None


class PackingOrderCreate(PackingOrderBase):
    items: list[PackingItemCreate] = []


class PackingOrderUpdate(BaseModel):
    order_no: str | None = None
    customer_id: uuid.UUID | None = None
    customer_name: str | None = None
    order_date: date | None = None
    status: str | None = None
    deposit: Decimal | None = None
    balance: Decimal | None = None
    bank_account: str | None = None
    items: list[PackingItemCreate] | None = None


class PackingOrderRead(PackingOrderBase):
    id: uuid.UUID
    ocr_status: str
    created_at: datetime
    updated_at: datetime
    items: list[PackingItemRead] = []

    model_config = ConfigDict(from_attributes=True)


class FileAssetRead(BaseModel):
    id: uuid.UUID
    biz_type: str
    biz_id: uuid.UUID | None
    file_type: str
    original_name: str
    storage_path: str
    mime_type: str | None
    file_size: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExcelImportResult(BaseModel):
    file: FileAssetRead
    order: PackingOrderRead


class ExcelImportResponse(BaseModel):
    imported: list[ExcelImportResult]


class ExportPackingRow(BaseModel):
    itemName: str = ""
    description: str = ""
    photo: str = ""
    quantity: str = ""
    unit: str = ""
    unitPrice: str = ""
    totalPrice: str = ""
    qtyPerCarton: str = ""
    cartonCount: str = ""
    grossWeightCtn: str = ""
    cbm: str = ""
    totalGrossWeight: str = ""
    measureCm: str = ""
    totalCbm: str = ""


class ExportOrderRecord(BaseModel):
    id: str
    date: str
    customer: str
    status: str
    rows: list[ExportPackingRow] = []


class ExcelExportRequest(BaseModel):
    records: list[ExportOrderRecord]


class ExcelExportResponse(BaseModel):
    file: FileAssetRead
    download_url: str


class OrderPreviewResponse(BaseModel):
    html: str


class HistoryFileExportRequest(BaseModel):
    file_ids: list[uuid.UUID] = Field(default_factory=list)
    order_ids: list[uuid.UUID] = Field(default_factory=list)


class HistoryFileDeleteRequest(BaseModel):
    file_ids: list[uuid.UUID] = Field(default_factory=list)
    order_ids: list[uuid.UUID] = Field(default_factory=list)


class HistoryFileDeleteResponse(BaseModel):
    deleted_files: int
    deleted_orders: int


class OcrAnalyzeRequest(BaseModel):
    file_id: uuid.UUID
    order_id: uuid.UUID | None = None


class OcrJobRead(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID | None
    source_file_id: uuid.UUID
    status: str
    raw_text: str | None
    parsed_json: dict | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StatsRequest(BaseModel):
    start_date: date
    end_date: date
    customer_ids: list[uuid.UUID] = []
    item_name: str | None = None
    description: str | None = None


class StatsSummary(BaseModel):
    detail_count: int
    quantity_total: Decimal
    amount_total: Decimal
    carton_total: Decimal
    gross_weight_total: Decimal
    cbm_total: Decimal


class StatsResponse(BaseModel):
    detail_rows: list[PackingItemRead]
    summary: StatsSummary
