from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.database import get_db, Conversation
from app.services.rag import query_rag
import json

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    session_id: str


@router.post("/ask")
async def ask_question(request: AskRequest, db: Session = Depends(get_db)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    full_answer = []
    sources = []

    def stream_and_save():
        nonlocal full_answer, sources
        for chunk in query_rag(request.question, request.session_id):
            yield f"data: {chunk}\n\n"
            parsed = json.loads(chunk)
            if "token" in parsed:
                full_answer.append(parsed["token"])
            if "sources" in parsed:
                sources.extend(parsed["sources"])

        # Save full conversation to PostgreSQL after streaming completes
        conversation = Conversation(
            session_id=request.session_id,
            question=request.question,
            answer="".join(full_answer).strip(),
            sources=json.dumps(sources),
        )
        db.add(conversation)
        db.commit()

    return StreamingResponse(
        stream_and_save(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
