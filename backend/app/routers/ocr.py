from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FileAsset
from app.schemas import OcrAnalyzeRequest, OcrJobRead
from app.services import create_ocr_job


router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("/analyze", response_model=OcrJobRead)
def analyze_photo(payload: OcrAnalyzeRequest, db: Session = Depends(get_db)):
    asset = db.get(FileAsset, payload.file_id)
    if not asset:
        raise HTTPException(status_code=404, detail="File not found")
    return create_ocr_job(db=db, file_id=payload.file_id, order_id=payload.order_id)
