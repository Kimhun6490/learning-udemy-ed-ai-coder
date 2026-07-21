# Project Plan

This document is the execution checklist for the MVP in [AGENTS.md](../AGENTS.md).

## Part 1: Plan and Documentation

### Checklist

- [x] Expand this plan into actionable, testable phases.
- [x] Add tests and success criteria for each phase.
- [x] Create [frontend/AGENTS.md](../frontend/AGENTS.md) describing the existing frontend code.
- [x] User reviews and approves this plan before implementation starts.

### Tests

- Documentation review with user.
- Verify all phases have explicit acceptance criteria.

### Success Criteria

- The user confirms the plan is approved.
- Scope, sequence, and test strategy are clear enough to execute without guesswork.

## Part 2: Scaffolding (Docker + FastAPI + scripts)

### Checklist

- [x] Create backend app structure under [backend/](../backend/).
- [x] Create minimal FastAPI app with:
	- [x] Health endpoint.
	- [x] Example API endpoint returning JSON.
	- [x] Root endpoint serving temporary hello-world HTML.
- [x] Add Dockerfile and related container config at project root.
- [x] Add start and stop scripts for macOS, Linux, and Windows in [scripts/](../scripts/).
- [x] Ensure scripts run the container and expose app on a local port.

### Tests

- Build container successfully.
- Start scripts launch app locally on all target OS script variants.
- GET `/` returns hello-world HTML.
- GET example API route returns expected JSON.
- Stop scripts cleanly stop and remove running container(s).

### Success Criteria

- A new developer can run one start script and see both HTML and API responses.
- The app runs entirely inside Docker.

## Part 3: Serve Existing Frontend

### Checklist

- [x] Build frontend static assets from [frontend/](../frontend/).
- [x] Update backend/container flow to serve the built frontend at `/`.
- [x] Keep API routes available under an API prefix.
- [x] Remove temporary hello-world page.

### Tests

- Frontend unit tests pass.
- Frontend e2e tests pass against containerized app.
- Browser check: `/` renders the existing Kanban board.
- API endpoint check still passes.

### Success Criteria

- Containerized app shows current Kanban UI at root URL.
- Existing drag, rename, add, delete behavior still works.

## Part 4: Fake Sign-in Experience

### Checklist

- [x] Add login screen shown before board access.
- [x] Validate hardcoded credentials: `user` / `password`.
- [x] Add logout action.
- [x] Protect board route(s) so unauthenticated users cannot access board UI.

### Tests

- Unit tests for auth logic.
- Integration tests for:
	- [x] Invalid credentials rejected.
	- [x] Valid login grants board access.
	- [x] Logout returns user to login screen.
- E2E happy path: login -> use board -> logout.

### Success Criteria

- Unauthenticated users always see login.
- Authenticated users can access board until logout.

## Part 5: Database Modeling

### Checklist

- [ ] Propose SQLite schema for users, board, columns, cards, and chat history.
- [ ] Define JSON representation of board state and update payloads.
- [ ] Document schema and JSON contracts in `docs/`.
- [x] Propose SQLite schema for users, board, columns, cards, and chat history.
- [x] Define JSON representation of board state and update payloads.
- [x] Document schema and JSON contracts in `docs/`.
- [x] Get user sign-off before implementation.

### Tests

- Schema review against required features (single board per user for MVP, multi-user capable design).
- Validate JSON examples for board read/write flows.

### Success Criteria

- User approves documented schema and JSON contracts.
- Data model supports all required board operations.

## Part 6: Backend CRUD + Persistence

### Checklist

- [x] Implement SQLite initialization and auto-create database file if missing.
- [x] Implement API routes to:
	- [x] Read board by authenticated user.
	- [x] Update columns (rename).
	- [x] Add/edit/move/delete cards.
- [x] Add request/response validation.
- [x] Add backend tests.

### Tests

- Backend unit tests for service/data-access logic.
- API tests for each route and validation failure paths.
- Persistence tests proving changes survive restart.

### Success Criteria

- API supports all board mutations required by UI.
- Board state persists in SQLite.

## Part 7: Frontend + Backend Integration

### Checklist

- [x] Replace in-memory board state bootstrap with backend fetch.
- [x] Wire all board actions to backend APIs.
- [x] Implement loading/error states for network operations.
- [x] Keep UX responsive and consistent after operations.

### Tests

- Frontend integration tests for API-driven flows.
- E2E tests covering fetch, mutate, refresh, and reload persistence.
- Regression run for existing unit tests.

### Success Criteria

- UI no longer depends on hardcoded board state.
- Reloading page shows persisted server state.

## Part 8: AI Connectivity (OpenRouter)

### Checklist

- [x] Add backend AI client using `OPENROUTER_API_KEY`.
- [x] Configure model `openai/gpt-oss-120b`.
- [x] Add minimal diagnostic endpoint/service method for AI connectivity.

### Tests

- Automated test with mocked provider client.
- Manual connectivity check using prompt `2+2`.
- Error-path check for missing/invalid API key.

### Success Criteria

- Backend can successfully call OpenRouter and return model text.

## Part 9: Structured AI Responses with Board Context

### Checklist

- [x] Define structured output schema:
	- [x] User-facing assistant message.
	- [x] Optional board update payload.
- [x] Send board JSON + user message + conversation history to AI.
- [x] Validate AI response against schema.
- [x] Apply valid board updates transactionally.

### Tests

- Unit tests for schema validation and board-update application.
- Contract tests for malformed AI responses.
- Integration tests for:
	- [x] Response-only AI replies.
	- [x] AI replies that update board.

### Success Criteria

- AI replies are reliable and schema-validated.
- Optional board updates are safely applied and persisted.

## Part 10: AI Sidebar UI + Live Board Refresh

### Checklist

- [x] Add sidebar chat UI to frontend.
- [x] Show chat history and loading/error states.
- [x] Send messages to backend AI endpoint.
- [x] Refresh board automatically after AI-driven board updates.
- [x] Keep existing board interactions intact.

### Tests

- Component tests for sidebar behavior.
- Integration tests for chat send/receive.
- E2E tests for AI updates reflected on board without manual reload.

### Success Criteria

- User can chat with AI in sidebar.
- AI can optionally update cards/columns and UI reflects updates automatically.

## Cross-phase Standards

### Checklist

- [x] Keep implementation simple and MVP-focused.
- [x] Use latest stable idiomatic libraries where practical.
- [x] Maintain concise docs and no extra features.
- [x] On issues: prove root cause with evidence before fixing.

### Release Criteria

- [x] All relevant automated tests pass.
- [x] App starts and stops using provided scripts.
- [x] Dockerized local flow is documented and reproducible.