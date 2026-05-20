import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import FileAsset, OcrJob


settings = get_settings()


def save_upload(db: Session, file: UploadFile, biz_type: str, file_type: str, biz_id: uuid.UUID | None = None) -> FileAsset:
    upload_dir = settings.upload_root / file_type
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix
    storage_name = f"{uuid.uuid4()}{suffix}"
    storage_path = upload_dir / storage_name

    with storage_path.open("wb") as output:
        shutil.copyfileobj(file.file, output)

    asset = FileAsset(
        biz_type=biz_type,
        biz_id=biz_id,
        file_type=file_type,
        original_name=file.filename or storage_name,
        storage_path=str(storage_path),
        mime_type=file.content_type,
        file_size=storage_path.stat().st_size,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def create_ocr_job(db: Session, file_id: uuid.UUID, order_id: uuid.UUID | None = None) -> OcrJob:
    # Placeholder for hermes/OCR integration. Keep parsed_json stable for frontend wiring.
    parsed = {
        "items": [
            {
                "row_index": 1,
                "item_name": "OCR 识别品名",
                "description": "OCR 识别产品描述",
                "quantity": "1",
                "unit": "set",
            }
        ]
    }
    job = OcrJob(
        order_id=order_id,
        source_file_id=file_id,
        status="succeeded",
        raw_text="OCR placeholder result. Replace this with hermes analysis output.",
        parsed_json=parsed,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
