# Frontend Overview

This document describes the current frontend implementation in [frontend/](.).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- dnd-kit for drag-and-drop
- Vitest + Testing Library for unit/component tests
- Playwright for e2e tests

## Current Behavior

- Root route renders a login gate from [src/app/page.tsx](src/app/page.tsx).
- Valid credentials are `user` / `password`.
- After login, board data is loaded from backend API.
- Board mutations are persisted through backend API.
- AI sidebar chat is available and can trigger board refresh after AI updates.
- User can:
  - Rename fixed columns inline.
  - Add a card to a column.
  - Delete a card.
  - Drag and drop cards within and across columns.
  - Log out back to login screen.

## Main Files

- [src/app/layout.tsx](src/app/layout.tsx): global fonts and app metadata.
- [src/app/globals.css](src/app/globals.css): design tokens and base styles.
- [src/app/page.tsx](src/app/page.tsx): root page that renders the board.
- [src/components/KanbanBoard.tsx](src/components/KanbanBoard.tsx): main board container and state orchestration.
- [src/components/KanbanColumn.tsx](src/components/KanbanColumn.tsx): column UI, rename input, droppable area, add form.
- [src/components/KanbanCard.tsx](src/components/KanbanCard.tsx): sortable draggable card with remove action.
- [src/components/KanbanCardPreview.tsx](src/components/KanbanCardPreview.tsx): drag overlay preview.
- [src/components/NewCardForm.tsx](src/components/NewCardForm.tsx): add-card form with local open/close state.
- [src/components/AiSidebar.tsx](src/components/AiSidebar.tsx): AI chat sidebar.
- [src/lib/kanban.ts](src/lib/kanban.ts): board types, initial data, card move utility, ID generation.
- [src/lib/api.ts](src/lib/api.ts): frontend API client for board and AI calls.
- [src/lib/auth.ts](src/lib/auth.ts): auth constants and credential validation.

## Data Model

Board model used by frontend and backend contract:

- Card: `id`, `title`, `details`
- Column: `id`, `title`, `cardIds[]`
- BoardData: `columns[]`, `cards` map keyed by card id

`initialData` still exists for tests and defaults, but runtime board state comes from backend.

## Drag and Drop Notes

- dnd-kit `DndContext` is configured in [src/components/KanbanBoard.tsx](src/components/KanbanBoard.tsx).
- `moveCard()` in [src/lib/kanban.ts](src/lib/kanban.ts) supports:
  - Reorder within same column.
  - Move across columns.
  - Drop directly on a column to append at end.

## Test Coverage (Current)

- [src/components/KanbanBoard.test.tsx](src/components/KanbanBoard.test.tsx):
  - Renders five columns.
  - Renames a column.
  - Adds then removes a card.
- [src/components/AiSidebar.test.tsx](src/components/AiSidebar.test.tsx):
  - Sends AI message and handles board-update callback.
- [src/app/page.test.tsx](src/app/page.test.tsx):
  - Login gate rendering.
  - Invalid credential handling.
  - Login then logout behavior.
- [src/lib/kanban.test.ts](src/lib/kanban.test.ts):
  - Reorder within a column.
  - Move to another column.
  - Drop to end of target column.
- [src/lib/auth.test.ts](src/lib/auth.test.ts):
  - Credential validation and storage key checks.
- [tests/kanban.spec.ts](tests/kanban.spec.ts):
  - Login + logout flow.
  - Add card.
  - Drag card between columns.
  - Board refresh after AI update.

## Known Limits

- Auth is frontend session-based only (MVP).
- Card editing UI is not yet exposed, though backend supports card updates.

## Commands

From [frontend/](.):

- `npm install`
- `npm run dev`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:all`
