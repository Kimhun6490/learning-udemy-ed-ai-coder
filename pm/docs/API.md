# Backend API

All API endpoints are served under /api.

## Health and Smoke

- GET /api/health
- GET /api/hello

## Board

- GET /api/board
  - returns { board }

- PUT /api/board
  - body: { board }
  - replaces full board after validation

- PATCH /api/board/columns/{column_id}
  - body: { title }
  - renames a column

- POST /api/board/cards
  - body: { columnId, title, details }
  - creates and appends a card to a column

- PATCH /api/board/cards/{card_id}
  - body: { title?, details?, columnId?, position? }
  - edits card fields and optional move

- DELETE /api/board/cards/{card_id}
  - removes card from cards map and all column cardIds arrays

## AI

- POST /api/ai/ping
  - connectivity check to OpenRouter with a 2+2 prompt

- POST /api/ai/chat
  - body: { message }
  - backend sends board JSON + conversation history + user message to AI
  - AI response must follow structured JSON contract
  - when board_update is present and valid, board is persisted
  - returns: { assistantMessage, boardUpdated }

## Auth behavior in MVP

Frontend gate uses hardcoded credentials user/password and sessionStorage.
Backend defaults requests to user unless an x-user header is provided.
