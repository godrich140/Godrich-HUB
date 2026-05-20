import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(40), default="operator", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)


class Customer(TimestampMixin, Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(80))
    email: Mapped[str | None] = mapped_column(String(160))
    address: Mapped[str | None] = mapped_column(Text)
    remark: Mapped[str | None] = mapped_column(Text)

    orders: Mapped[list["PackingOrder"]] = relationship(back_populates="customer")


class PackingOrder(TimestampMixin, Base):
    __tablename__ = "packing_orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_no: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    customer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"))
    customer_name: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    order_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True, nullable=False)
    deposit: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    balance: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    bank_account: Mapped[str | None] = mapped_column(Text)
    ocr_status: Mapped[str] = mapped_column(String(30), default="not_started", nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    customer: Mapped[Customer | None] = relationship(back_populates="orders")
    items: Mapped[list["PackingItem"]] = relationship(back_populates="order", cascade="all, delete-orphan", order_by="PackingItem.row_index")


class PackingItem(TimestampMixin, Base):
    __tablename__ = "packing_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("packing_orders.id", ondelete="CASCADE"), index=True, nullable=False)
    row_index: Mapped[int] = mapped_column(Integer, nullable=False)
    item_name: Mapped[str | None] = mapped_column(String(240), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    photo_file_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="SET NULL"))
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    unit: Mapped[str | None] = mapped_column(String(40))
    unit_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    total_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    qty_per_carton: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    carton_count: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    gross_weight_ctn: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    cbm: Mapped[Decimal | None] = mapped_column(Numeric(12, 4))
    total_gross_weight: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    measure_cm: Mapped[str | None] = mapped_column(String(120))
    total_cbm: Mapped[Decimal | None] = mapped_column(Numeric(12, 4))
    merge_group_id: Mapped[str | None] = mapped_column(String(80), index=True)

    order: Mapped[PackingOrder] = relationship(back_populates="items")

    __table_args__ = (Index("ix_packing_items_order_row", "order_id", "row_index", unique=True),)


class FileAsset(TimestampMixin, Base):
    __tablename__ = "files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    biz_type: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    biz_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    file_type: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(120))
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)


class OcrJob(TimestampMixin, Base):
    __tablename__ = "ocr_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("packing_orders.id", ondelete="SET NULL"), index=True)
    source_file_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True, nullable=False)
    raw_text: Mapped[str | None] = mapped_column(Text)
    parsed_json: Mapped[dict | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)


class ExportRecord(TimestampMixin, Base):
    __tablename__ = "export_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("packing_orders.id", ondelete="CASCADE"), index=True, nullable=False)
    export_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    biz_type: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    biz_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    detail_json: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
