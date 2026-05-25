import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Document
from app.services.rag import ingest_pdf

router = APIRouter()
UPLOAD_DIR = "/tmp/financegpt_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunk_count = ingest_pdf(file_path, session_id)

    doc = Document(
        session_id=session_id,
        filename=file.filename,
        chunk_count=chunk_count,
    )
    db.add(doc)
    db.commit()

    return {
        "message": "Document processed successfully",
        "filename": file.filename,
        "chunks": chunk_count,
    }
