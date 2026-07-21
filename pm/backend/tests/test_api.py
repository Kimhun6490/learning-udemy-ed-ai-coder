import importlib
import sys
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import main as main_module  # noqa: E402


def make_client(db_path: Path) -> tuple[TestClient, object]:
    import os

    os.environ["DATABASE_PATH"] = str(db_path)
    module = importlib.reload(main_module)
    return TestClient(module.app), module


def test_get_board_returns_default(tmp_path):
    client, _ = make_client(tmp_path / "test.db")
    with client:
        response = client.get("/api/board")
    assert response.status_code == 200
    body = response.json()
    assert len(body["board"]["columns"]) == 5
    assert "card-1" in body["board"]["cards"]


def test_column_rename(tmp_path):
    client, _ = make_client(tmp_path / "test.db")
    with client:
        response = client.patch("/api/board/columns/col-backlog", json={"title": "Ideas"})
        assert response.status_code == 200
        board = response.json()["board"]
    assert board["columns"][0]["title"] == "Ideas"


def test_add_update_move_and_delete_card(tmp_path):
    client, _ = make_client(tmp_path / "test.db")
    with client:
        created = client.post(
            "/api/board/cards",
            json={"columnId": "col-backlog", "title": "New task", "details": "details"},
        )
        assert created.status_code == 200
        card_id = created.json()["cardId"]

        updated = client.patch(
            f"/api/board/cards/{card_id}",
            json={"title": "Updated task", "columnId": "col-review", "position": 0},
        )
        assert updated.status_code == 200
        board = updated.json()["board"]
        assert board["cards"][card_id]["title"] == "Updated task"
        assert board["columns"][3]["cardIds"][0] == card_id

        deleted = client.delete(f"/api/board/cards/{card_id}")
        assert deleted.status_code == 200
        board = deleted.json()["board"]

    assert card_id not in board["cards"]
    assert all(card_id not in column["cardIds"] for column in board["columns"])


def test_put_board_persists_after_restart(tmp_path):
    db_path = tmp_path / "test.db"
    client, _ = make_client(db_path)
    with client:
        original = client.get("/api/board").json()["board"]
        original["columns"][0]["title"] = "Persisted"
        saved = client.put("/api/board", json={"board": original})
        assert saved.status_code == 200

    client2, _ = make_client(db_path)
    with client2:
        board = client2.get("/api/board").json()["board"]
    assert board["columns"][0]["title"] == "Persisted"


def test_ai_ping_returns_503_without_key(tmp_path, monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    client, _ = make_client(tmp_path / "test.db")
    with client:
        response = client.post("/api/ai/ping")
    assert response.status_code == 503


def test_ai_chat_applies_board_update(tmp_path):
    client, module = make_client(tmp_path / "test.db")

    def fake_structured_chat(board, history, user_message):
        board["columns"][0]["title"] = "AI Updated"
        return "Updated the board.", board

    module.structured_chat = fake_structured_chat

    with client:
        response = client.post("/api/ai/chat", json={"message": "rename first column"})
        assert response.status_code == 200
        body = response.json()
        assert body["boardUpdated"] is True
        assert body["assistantMessage"] == "Updated the board."

        board = client.get("/api/board").json()["board"]

    assert board["columns"][0]["title"] == "AI Updated"
