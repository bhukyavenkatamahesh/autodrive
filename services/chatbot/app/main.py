import json
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="AutoDrive Chatbot Service")


class ChatRequest(BaseModel):
    message: str
    session_id: str


def _build_reply(message: str) -> tuple[str, list[dict[str, str]]]:
    msg = message.lower()
    actions: list[dict[str, str]] = []

    if "electric" in msg:
        reply = (
            "I found electric options in our inventory. "
            "Open the cars page and use the Electric filter to narrow results quickly."
        )
    elif "book" in msg or "test drive" in msg:
        reply = (
            "Sure, I can help with a test drive. "
            "I am redirecting you to a car detail page where booking can be completed."
        )
        actions.append({"type": "BOOK_TEST_DRIVE", "car_id": "1"})
    elif "hello" in msg or "hi" in msg:
        reply = "Hi! Tell me your budget, city, and preferred fuel type, and I will suggest cars."
    else:
        reply = (
            "I can help you find cars by budget, fuel type, city, and booking intent. "
            "Try asking: Show me SUVs under 15 lakhs."
        )

    return reply, actions


@app.post("/chat")
def chat(req: ChatRequest) -> dict:
    reply, actions = _build_reply(req.message)
    return {
        "response": reply,
        "session_id": req.session_id,
        "actions": actions,
    }


async def _sse_stream(message: str, session_id: str) -> AsyncGenerator[str, None]:
    reply, actions = _build_reply(message)

    for token in reply.split(" "):
        yield f"data: {json.dumps({'token': token + ' '})}\n\n"

    for action in actions:
        yield f"data: {json.dumps({'action': action['type'], 'car_id': action['car_id']})}\n\n"

    yield "data: [DONE]\n\n"


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    return StreamingResponse(
        _sse_stream(req.message, req.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "chatbot", "status": "ok"}
