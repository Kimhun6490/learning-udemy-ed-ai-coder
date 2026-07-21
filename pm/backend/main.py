from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from ai_client import ping_openrouter, structured_chat
from db import (
    add_chat_message,
    get_board_for_user,
    get_chat_messages,
    get_user_id,
    init_db,
    save_board_for_user,
)
from models import (
    AddCardPayload,
    AiChatPayload,
    AiChatResult,
    BoardData,
    RenameColumnPayload,
    ReplaceBoardPayload,
    UpdateCardPayload,
)

app = FastAPI(title="PM MVP Backend")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def _user_id_from_header(x_user: str | None) -> int:
    username = x_user or "user"
    try:
        return get_user_id(username)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def _validated_board(data: dict[str, Any]) -> dict[str, Any]:
    return BoardData.model_validate(data).model_dump()


def _move_card_in_columns(
    columns: list[dict[str, Any]],
    card_id: str,
    target_column_id: str,
    target_position: int | None,
) -> None:
    for column in columns:
        if card_id in column["cardIds"]:
            column["cardIds"] = [existing for existing in column["cardIds"] if existing != card_id]

    target_column = next((column for column in columns if column["id"] == target_column_id), None)
    if target_column is None:
        raise HTTPException(status_code=404, detail="Target column not found")

    insert_at = target_position if target_position is not None else len(target_column["cardIds"])
    insert_at = max(0, min(insert_at, len(target_column["cardIds"])))
    target_column["cardIds"].insert(insert_at, card_id)


@app.get("/api/hello")
def api_hello() -> dict[str, str]:
    return {"message": "hello from fastapi"}


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/board")
def get_board(x_user: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = _validated_board(get_board_for_user(user_id))
    return {"board": board}


@app.put("/api/board")
def replace_board(payload: ReplaceBoardPayload, x_user: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = payload.board.model_dump()
    save_board_for_user(user_id, board)
    return {"board": board}


@app.patch("/api/board/columns/{column_id}")
def rename_column(
    column_id: str,
    payload: RenameColumnPayload,
    x_user: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = get_board_for_user(user_id)
    column = next((item for item in board["columns"] if item["id"] == column_id), None)
    if column is None:
        raise HTTPException(status_code=404, detail="Column not found")
    column["title"] = payload.title.strip()
    validated = _validated_board(board)
    save_board_for_user(user_id, validated)
    return {"board": validated}


@app.post("/api/board/cards")
def add_card(payload: AddCardPayload, x_user: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = get_board_for_user(user_id)
    column = next((item for item in board["columns"] if item["id"] == payload.columnId), None)
    if column is None:
        raise HTTPException(status_code=404, detail="Column not found")

    card_id = f"card-{uuid4().hex[:10]}"
    board["cards"][card_id] = {
        "id": card_id,
        "title": payload.title.strip(),
        "details": payload.details.strip() or "No details yet.",
    }
    column["cardIds"].append(card_id)

    validated = _validated_board(board)
    save_board_for_user(user_id, validated)
    return {"board": validated, "cardId": card_id}


@app.patch("/api/board/cards/{card_id}")
def update_card(
    card_id: str,
    payload: UpdateCardPayload,
    x_user: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = get_board_for_user(user_id)
    card = board["cards"].get(card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")

    if payload.title is not None:
        card["title"] = payload.title.strip()
    if payload.details is not None:
        card["details"] = payload.details
    if payload.columnId is not None:
        _move_card_in_columns(board["columns"], card_id, payload.columnId, payload.position)

    validated = _validated_board(board)
    save_board_for_user(user_id, validated)
    return {"board": validated}


@app.delete("/api/board/cards/{card_id}")
def delete_card(card_id: str, x_user: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _user_id_from_header(x_user)
    board = get_board_for_user(user_id)
    if card_id not in board["cards"]:
        raise HTTPException(status_code=404, detail="Card not found")

    del board["cards"][card_id]
    for column in board["columns"]:
        column["cardIds"] = [existing for existing in column["cardIds"] if existing != card_id]

    validated = _validated_board(board)
    save_board_for_user(user_id, validated)
    return {"board": validated}


@app.post("/api/ai/ping")
def ai_ping() -> dict[str, str]:
    try:
        text = ping_openrouter().strip()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - passthrough for provider errors
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc
    return {"response": text}


@app.post("/api/ai/chat", response_model=AiChatResult)
def ai_chat(payload: AiChatPayload, x_user: str | None = Header(default=None)) -> AiChatResult:
    user_id = _user_id_from_header(x_user)
    board = _validated_board(get_board_for_user(user_id))
    history = get_chat_messages(user_id)
    add_chat_message(user_id, "user", payload.message)

    try:
        assistant_message, board_update = structured_chat(
            board=board,
            history=history,
            user_message=payload.message,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - passthrough for provider errors
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    add_chat_message(user_id, "assistant", assistant_message)

    board_updated = False
    if board_update is not None:
        validated = _validated_board(board_update)
        save_board_for_user(user_id, validated)
        board_updated = True

    return AiChatResult(assistantMessage=assistant_message, boardUpdated=board_updated)


frontend_dist = Path(__file__).parent / "static"

if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:

    @app.get("/", response_class=HTMLResponse)
    def root() -> str:
        return """<!doctype html>
<html lang=\"en\"><body><h1>Frontend build not found.</h1></body></html>"""
