# Backend Folder

This folder contains the FastAPI backend for the PM MVP.

Current contents:

- `main.py`: API routes, board CRUD, AI endpoints, static frontend serving.
- `db.py`: SQLite initialization and persistence utilities.
- `models.py`: request/response and board validation models.
- `board_defaults.py`: default board seed data.
- `ai_client.py`: OpenRouter connectivity + structured output call.
- `tests/test_api.py`: backend API and persistence tests.
- `pyproject.toml`: dependencies and dev test tooling.

Container/runtime notes:

- The app is run inside Docker from the repository root `Dockerfile`.
- Runtime command is `uv run uvicorn main:app --host 0.0.0.0 --port 8000`.