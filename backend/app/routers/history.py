from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, Conversation
import json

router = APIRouter()


@router.get("/history")
def get_history(session_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Conversation).order_by(Conversation.timestamp.desc())
    if session_id:
        query = query.filter(Conversation.session_id == session_id)
    conversations = query.limit(50).all()

    return [
        {
            "id": c.id,
            "session_id": c.session_id,
            "question": c.question,
            "answer": c.answer,
            "sources": json.loads(c.sources) if c.sources else [],
            "timestamp": c.timestamp.isoformat(),
        }
        for c in conversations
    ]


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_db)):
    db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).delete()
    db.commit()
    return {"message": "History cleared"}
