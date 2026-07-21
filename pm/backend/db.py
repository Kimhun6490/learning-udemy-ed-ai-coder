import json
import sqlite3
from pathlib import Path
from typing import Any

from board_defaults import default_board_copy


def get_db_path() -> Path:
    from os import getenv

    raw_path = getenv("DATABASE_PATH")
    if raw_path:
        return Path(raw_path)
    return Path(__file__).parent / "data" / "pm.db"


def connect() -> sqlite3.Connection:
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS boards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                state_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
            """
        )
        conn.execute(
            "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
            ("user", "password"),
        )


def get_user_id(username: str = "user") -> int:
    with connect() as conn:
        row = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not row:
            raise ValueError(f"User not found: {username}")
        return int(row["id"])


def get_board_for_user(user_id: int) -> dict[str, Any]:
    with connect() as conn:
        row = conn.execute(
            "SELECT state_json FROM boards WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if row:
            return json.loads(str(row["state_json"]))

        board = default_board_copy()
        conn.execute(
            "INSERT INTO boards (user_id, state_json) VALUES (?, ?)",
            (user_id, json.dumps(board)),
        )
        return board


def save_board_for_user(user_id: int, board: dict[str, Any]) -> None:
    with connect() as conn:
        payload = json.dumps(board)
        existing = conn.execute(
            "SELECT id FROM boards WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if existing:
            conn.execute(
                """
                UPDATE boards
                SET state_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                (payload, user_id),
            )
        else:
            conn.execute(
                "INSERT INTO boards (user_id, state_json) VALUES (?, ?)",
                (user_id, payload),
            )


def add_chat_message(user_id: int, role: str, content: str) -> None:
    with connect() as conn:
        conn.execute(
            "INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)",
            (user_id, role, content),
        )


def get_chat_messages(user_id: int, limit: int = 20) -> list[dict[str, str]]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT role, content
            FROM chat_messages
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    messages = [{"role": str(row["role"]), "content": str(row["content"])} for row in rows]
    messages.reverse()
    return messages
