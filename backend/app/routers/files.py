from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import FileAssetRead
from app.services import save_upload


router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileAssetRead)
def upload_file(
    file: UploadFile = File(...),
    biz_type: str = Form(default="packing_order"),
    file_type: str = Form(default="photos"),
    db: Session = Depends(get_db),
):
    return save_upload(db=db, file=file, biz_type=biz_type, file_type=file_type)
