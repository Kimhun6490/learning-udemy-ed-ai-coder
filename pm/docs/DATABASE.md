# Database Design (Part 5)

This MVP uses SQLite and stores one board per user while keeping the schema ready for multi-user support.

## Why this shape

- MVP supports one hardcoded user session in UI, but schema supports many users.
- Board is stored as JSON for simplicity and low migration overhead in MVP.
- Chat history is persisted for AI context.

## Tables

## users

- id INTEGER PRIMARY KEY
- username TEXT UNIQUE NOT NULL
- password TEXT NOT NULL

MVP seed row:

- username: user
- password: password

## boards

- id INTEGER PRIMARY KEY
- user_id INTEGER UNIQUE NOT NULL
- state_json TEXT NOT NULL
- updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

Notes:

- UNIQUE(user_id) enforces one board per user.
- state_json stores the canonical board JSON payload.

## chat_messages

- id INTEGER PRIMARY KEY
- user_id INTEGER NOT NULL
- role TEXT NOT NULL
- content TEXT NOT NULL
- created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

Notes:

- role is expected to be user or assistant.
- Latest messages are loaded and sent with AI requests.

## Board JSON contract

The backend stores and validates this shape:

- columns: array of { id, title, cardIds[] }
- cards: map keyed by card id with values { id, title, details }

Example:

```json
{
  "columns": [
    { "id": "col-backlog", "title": "Backlog", "cardIds": ["card-1"] },
    { "id": "col-done", "title": "Done", "cardIds": [] }
  ],
  "cards": {
    "card-1": { "id": "card-1", "title": "Task", "details": "Details" }
  }
}
```

## AI structured output contract

AI responses are required to be JSON with:

- assistant_message: string
- board_update: null or full board JSON matching the board contract

When board_update is non-null, the backend validates and replaces persisted board state.
