# Code Review — Kimhun Malai Portfolio Site

**Review date:** May 2026  
**Reviewer role:** Static analysis + architecture review (no code changes made)  
**Project:** Next.js 16 portfolio with OpenRouter Digital Twin chat  
**Build status at review time:** `npm run build` passes  
**Lint status at review time:** `npm run lint` **fails** (2 errors)

---

## Executive summary

This is a well-structured beginner-to-intermediate portfolio: clear separation of content (`profile.ts`), polished UI, and a working AI feature with the API key kept server-side. For local development and personal use, it is in good shape.

**Before production deployment**, the highest-priority gaps are **API abuse protection** (rate limits, message caps), **prompt-injection hardening** on chat history, and **fixing ESLint failures** so quality gates do not silently fail. Accessibility and performance optimizations are important but secondary to cost and security exposure on a public `/api/chat` endpoint.

| Severity | Count (approx.) |
|----------|-----------------|
| Critical | 0 |
| High     | 6 |
| Medium   | 14 |
| Low      | 10 |
| Info     | 8 |

---

## Scope and methodology

**In scope**

- All source under `src/` (app router, components, data, lib)
- `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- `.gitignore`, environment variable usage pattern
- Build and lint commands

**Out of scope**

- Runtime penetration testing
- OpenRouter billing/account review
- Visual design critique beyond a11y contrast notes
- `linkedin.pdf` content accuracy vs live LinkedIn

**Method**

- Full read of application source files
- `npm run build`, `npm run lint`, `npm audit` (moderate threshold)

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (almost entirely Client Components)                │
│  page.tsx → Header, Hero, …, DigitalTwin, Footer            │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /api/chat { messages }
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Route Handler (src/app/api/chat/route.ts)          │
│  • Validates messages                                       │
│  • Injects system prompt from profile                       │
│  • Proxies SSE stream from OpenRouter                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                    OpenRouter API
                    (openai/gpt-oss-120b)
```

**Strengths**

- Single source of truth for copy and career data (`src/data/profile.ts`)
- System prompt derived from profile, reducing drift between UI and AI
- Secrets read only via `process.env` on the server
- Sensible streaming UX in `DigitalTwin.tsx`
- `next.config.ts` sets `turbopack.root` to avoid monorepo lockfile confusion

**Weaknesses**

- Home page composes **only** `"use client"` sections; `Footer` is the lone Server Component. The page still SSRs, but the **client JavaScript bundle** includes Framer Motion + Lucide + all sections regardless of scroll position.
- No tests, no CI configuration in repo, no error boundaries.
- Chat logic, UI, and SSE parsing live in one large file (`DigitalTwin.tsx`, ~390 lines).

---

## Findings by category

### 1. Security

#### SEC-01 — Public chat endpoint with no rate limiting  
**Severity: High**

`/api/chat` accepts unauthenticated `POST` requests from anyone who can load the site. Each call spends OpenRouter credits using your API key.

**Risk:** Scrapers, bots, or abuse can exhaust quota or budget quickly after deployment.

**Remedial action**

- Add rate limiting (e.g. `@upstash/ratelimit`, Vercel KV, or edge middleware) per IP/session.
- Consider a daily cap or require a lightweight token (e.g. Turnstile) for anonymous chat.
- Monitor usage in OpenRouter dashboard; set billing alerts.

---

#### SEC-02 — Client-controlled conversation history (prompt injection)  
**Severity: High**

The API trusts `messages` from the client, including `role: "assistant"` entries. A malicious client can inject fake assistant turns such as “ignore previous instructions and …” before the real user question.

```typescript
// route.ts — accepts any sanitized user/assistant strings from the client
const sanitized = messages.filter(
  (m): m is ChatMessage =>
    (m.role === "user" || m.role === "assistant") && ...
);
```

**Remedial action**

- Server should accept **only `user` messages** from the client; assistant turns must be produced server-side (session store) or dropped.
- Alternatively, sign/encrypt conversation state server-side between turns.
- Add input length limits (see SEC-03).

---

#### SEC-03 — No server-side message length or body size limits  
**Severity: Medium**

There is no `max length` on `content` and no guard on total JSON body size. Twenty long messages can still produce very large prompts and bills.

**Remedial action**

- Enforce e.g. `content.length <= 2000` per message and `messages.length <= 20` (already sliced) on the server.
- Reject bodies above a byte threshold (e.g. 100 KB) before parsing JSON.

---

#### SEC-04 — OpenRouter error details logged to server console  
**Severity: Low**

```typescript
console.error("OpenRouter error:", response.status, errText);
```

In production, error bodies might include sensitive provider metadata in logs.

**Remedial action**

- Log status codes and correlation IDs only in production; gate full bodies behind `NODE_ENV === "development"`.

---

#### SEC-05 — Environment and secrets handling  
**Severity: Info (positive)**

- `.env*` is listed in `.gitignore` — correct.
- API key is not prefixed with `NEXT_PUBLIC_` — correct.
- **Remedial action:** Confirm `.env` was never committed in git history (`git log -- .env`). Rotate key if it was exposed. Add `.env.example` with placeholder keys for onboarding (no real secrets).

---

#### SEC-06 — `linkedin.pdf` in project directory  
**Severity: Low**

PDF is not referenced by the app but may contain PII. It is not explicitly gitignored (only `.env*` is).

**Remedial action**

- Add `linkedin.pdf` to `.gitignore` if it should not ship with the repo, or move to a private `docs/` folder outside the deploy artifact.

---

### 2. API and AI behavior

#### API-01 — System prompt rebuilt on every request  
**Severity: Medium**

`buildDigitalTwinSystemPrompt()` runs on each chat request. For a static profile, this is unnecessary CPU and adds tokens if the implementation ever duplicates content.

**Remedial action**

- Cache the prompt string in a module-level constant or `unstable_cache` / memoize until `profile` changes.

---

#### API-02 — Model-specific streaming behavior not fully handled  
**Severity: Medium**

`openai/gpt-oss-120b` may emit long **reasoning** deltas before **content** deltas. The client only appends `delta.content`:

```typescript
const delta = json.choices?.[0]?.delta?.content;
if (delta) text += delta;
```

This is correct for user-visible text but can cause long “Thinking…” states or empty-response errors on providers that never populate `content`.

**Remedial action**

- Document model expectations in `README.md`.
- Optionally show a “still thinking” state after N seconds.
- Consider a fallback non-streaming request if streamed `content` is empty after stream end (already throws “Empty response”).

---

#### API-03 — Raw upstream stream proxied without transformation  
**Severity: Low**

The handler returns `response.body` directly from OpenRouter. If the provider changes SSE format, the client breaks.

**Remedial action**

- Long term: normalize SSE in the route handler to a stable internal format.
- Short term: validate `Content-Type` includes `text/event-stream` before piping.

---

#### API-04 — No `POST`-only documentation; other methods undefined  
**Severity: Info**

Only `POST` is exported — Next.js returns 405 for other methods. Acceptable.

**Remedial action:** None required.

---

#### API-05 — Hardcoded model name  
**Severity: Info**

`OPENROUTER_MODEL` in `digital-twin-prompt.ts` is fine for a personal site.

**Remedial action:** Move to `OPENROUTER_MODEL` env var if you want to switch models without redeploying.

---

### 3. Frontend and React

#### FE-01 — ESLint fails (React purity rule)  
**Severity: High (for teams using CI)**

```
DigitalTwin.tsx — Date.now() flagged in sendMessage (lines 158, 169)
```

`Date.now()` is used inside `sendMessage` (event handler), not during render. This appears to be a **false positive** from `react-hooks/purity`, but **`npm run lint` exits with code 1** today.

**Remedial action**

- Replace IDs with `crypto.randomUUID()` inside the handler, or
- Disable/adjust the rule for event handlers, or
- Extract ID generation to a small `generateId()` helper marked appropriately for the linter.

---

#### FE-02 — Excessive `"use client"` surface  
**Severity: Medium**

Nine of ten UI modules are Client Components. Sections that only animate on scroll (`About`, `Portfolio`, `Contact`) could be Server Components wrapping small client animation wrappers, reducing hydrated surface.

**Remedial action**

- Split into `About.tsx` (server) + `FadeIn.tsx` (client wrapper).
- Lazy-load `DigitalTwin` with `next/dynamic({ ssr: false })` if chat is below the fold.

---

#### FE-03 — `DigitalTwin.tsx` size and duplication  
**Severity: Medium**

One file handles: section layout, floating button, modal, SSE parsing, API calls, and subcomponents. Desktop shows **both** embedded chat (`lg:flex`) and the floating FAB (`fixed bottom-6`), which is redundant on large screens.

**Remedial action**

- Extract `useDigitalTwinChat()` hook, `parseSseChunk`, and presentational subcomponents to separate files.
- Hide FAB when `lg:` and inline chat is visible (`lg:hidden` on FAB).

---

#### FE-04 — No `AbortController` for in-flight requests  
**Severity: Medium**

If the user closes the modal or navigates away mid-stream, the fetch and `setState` loop continue.

**Remedial action**

- Pass `signal` from `AbortController` to `fetch`.
- Abort on modal close/unmount; guard `setMessages` with an `isMounted` ref or abort check.

---

#### FE-05 — Frequent re-renders during streaming  
**Severity: Low**

Every SSE chunk triggers `setMessages` for the full accumulated string.

**Remedial action**

- Throttle updates (e.g. `requestAnimationFrame` or 50 ms batching) for smoother performance on long replies.

---

#### FE-06 — `Stats` and `TechMarquee` not tied to `profile`  
**Severity: Low**

```typescript
// Stats.tsx — hardcoded
{ value: "3", label: "Companies" },

// profile.ts — four distinct employers (Zimpligital, Amity, Toneer; Amity counted once)
```

Marquee lists tech strings manually while `profile.skills` exists.

**Remedial action**

- Derive stats from `profile.experience` (unique companies, date range) or document why numbers are marketing rounded.
- Generate marquee from `profile.skills.map(s => s.name)`.

---

### 4. Accessibility (a11y)

#### A11Y-01 — Chat modal lacks focus trap and Escape-to-close  
**Severity: Medium**

Overlay closes on backdrop click, but keyboard users can tab behind the modal. No `Escape` handler.

**Remedial action**

- Use a focus-trap library (`focus-trap-react`) or Radix Dialog.
- Add `onKeyDown` for `Escape` → `setPanelOpen(false)`.
- Set `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the panel.

---

#### A11Y-02 — Streaming replies not announced to screen readers  
**Severity: Medium**

Assistant messages update incrementally without `aria-live`.

**Remedial action**

- Add `aria-live="polite"` (and `aria-atomic="false"`) on the message list or latest assistant bubble.

---

#### A11Y-03 — Focus styles weakened on chat input  
**Severity: Low**

```tsx
className="... outline-none focus:border-[#00e5c2]/40 ..."
```

Border change may be insufficient for WCAG 2.4.7 Focus Visible.

**Remedial action**

- Add `focus-visible:ring-2 focus-visible:ring-[#00e5c2]` (and avoid removing outline without replacement).

---

#### A11Y-04 — Mobile nav menu  
**Severity: Low**

Menu opens without moving focus into the panel or trapping focus. No `aria-expanded` on the menu button.

**Remedial action**

- Set `aria-expanded={open}` on the menu button.
- Focus first link when opening; restore focus on close.

---

#### A11Y-05 — Reduced motion partially supported  
**Severity: Info (positive)**

Marquee animation disabled under `prefers-reduced-motion`. Framer Motion animations still run elsewhere.

**Remedial action**

- Respect `prefers-reduced-motion` for Framer Motion via `useReducedMotion()` hook.

---

#### A11Y-06 — Portfolio “Preview” label  
**Severity: Low**

Cards show “Preview” with an arrow but are not links or buttons — misleading for assistive tech and sighted users.

**Remedial action**

- Remove “Preview” until links exist, or use `<button disabled>` with explanation.

---

### 5. Performance

#### PERF-01 — Large client bundle from Framer Motion + full client tree  
**Severity: Medium**

Every section imports `framer-motion`. For a static portfolio, this is a heavy default.

**Remedial action**

- Run `@next/bundle-analyzer` and measure First Load JS.
- Replace simple fade-ins with CSS `@keyframes` where possible.
- Dynamic import Framer Motion only in components that need complex motion.

---

#### PERF-02 — Three Google font families  
**Severity: Low**

`layout.tsx` loads DM Sans, Syne, and JetBrains Mono with multiple weights.

**Remedial action**

- Reduce weight variants to those actually used.
- Subset fonts if adding more glyphs later.

---

#### PERF-03 — Static page with dynamic API route  
**Severity: Info (positive)**

`/` is statically generated; `/api/chat` is dynamic — appropriate split.

**Remedial action:** None required.

---

### 6. Data quality and content consistency

#### DATA-01 — Overlapping employment dates in profile  
**Severity: Medium (content accuracy)**

From `profile.ts`:

- Zimpligital: Aug 2024 — **Present**
- Amity Freelance: Apr 2025 — Mar 2026
- Amity Senior Android: Aug 2023 — Jul 2024

Overlapping full-time and contract roles may confuse the Digital Twin or recruiters unless intentional.

**Remedial action**

- Clarify part-time/contract vs full-time in descriptions.
- Align `highlight: true` to a single “current” role or allow multiple with labels.

---

#### DATA-02 — Em dashes in profile copy and prompt  
**Severity: Info**

UI strings use Unicode em dashes (`—`). HTTP headers were fixed to ASCII; body text is fine.

**Remedial action:** None unless targeting strict ASCII environments.

---

#### DATA-03 — Portfolio `href: "#"`  
**Severity: Low**

Placeholder links scroll to top of page if wired as `<a href="#">`.

**Remedial action**

- Use `<div>` or `<button type="button" disabled>` until real URLs exist (current Portfolio cards are not links — good).

---

### 7. Styling and design system

#### CSS-01 — Design tokens defined but rarely used via variables in JSX  
**Severity: Low**

`globals.css` defines `--accent`, `--text-muted`, etc., but components mostly use literal hex (`#00e5c2`, `#8b95a8`).

**Remedial action**

- Extend `@theme` in Tailwind v4 to map `text-muted`, `bg-deep`, etc., and replace hex duplicates.

---

#### CSS-02 — `-webkit-mask` without standard `mask` fallback  
**Severity: Low**

`.gradient-border::before` uses `-webkit-mask` only; verify Firefox behavior.

**Remedial action**

- Add standard `mask` properties per MDN for cross-browser gradient borders.

---

### 8. SEO and metadata

#### SEO-01 — Metadata present  
**Severity: Info (positive)**

`layout.tsx` sets `title`, `description`, and basic Open Graph.

**Remedial action**

- Add `metadata.openGraph.url`, `images`, and Twitter card fields when deploying to a known domain.

---

#### SEO-02 — No `robots.txt`, sitemap, or JSON-LD  
**Severity: Low**

Single-page site is indexable but lacks structured data for Person/ProfilePage.

**Remedial action**

- Add `app/sitemap.ts` and `app/robots.ts` (Next.js conventions).
- Optional JSON-LD for `Person` with name, jobTitle, url, sameAs (LinkedIn).

---

### 9. Testing and tooling

#### TEST-01 — No automated tests  
**Severity: Medium**

No unit, integration, or E2E tests.

**Remedial action**

- **Unit:** `buildDigitalTwinSystemPrompt()`, `parseSseChunk()`, message sanitization in `route.ts`.
- **E2E:** Playwright — load home, send chat message, expect streamed reply substring.

---

#### TEST-02 — Lint fails; no pre-commit hook  
**Severity: Medium**

CI would fail on `npm run lint` if added today.

**Remedial action**

- Fix SEC-01/FE-01 lint items.
- Add GitHub Action: `lint`, `build`, optional `test`.

---

#### TEST-03 — `npm audit` moderate vulnerabilities  
**Severity: Low**

Audit reported 2 moderate issues (typical in eslint/next transitive deps at review time).

**Remedial action**

- Run `npm audit` and apply safe fixes; document accepted risks for dev-only deps.

---

### 10. TypeScript and type safety

#### TS-01 — `profile` is untyped inferred object  
**Severity: Low**

No exported `Profile`, `Experience`, or `PortfolioItem` interfaces; `as const` only on portfolio status.

**Remedial action**

- Define `export type Profile = { ... }` and type `profile` explicitly.
- Share message types between API route and `DigitalTwin.tsx`.

---

#### TS-02 — Strict mode enabled  
**Severity: Info (positive)**

`"strict": true` in `tsconfig.json`.

**Remedial action:** None required.

---

## Component-by-component notes

| File | Assessment |
|------|------------|
| `src/app/page.tsx` | Clean composition; consider dynamic import for chat |
| `src/app/layout.tsx` | Solid fonts and metadata |
| `src/app/globals.css` | Good design tokens; partial adoption in components |
| `src/app/api/chat/route.ts` | Core logic sound; needs rate limits and stricter history rules |
| `src/data/profile.ts` | Excellent centralization; verify date overlaps |
| `src/lib/digital-twin-prompt.ts` | Clear rules; hardcoded first name “Kimhun” in prompt |
| `src/components/DigitalTwin.tsx` | Feature-complete; largest maintenance and a11y debt |
| `src/components/Header.tsx` | Works; mobile a11y gaps |
| `src/components/Hero.tsx` | Strong UX; client-only for motion |
| `src/components/Journey.tsx` | Timeline readable; alternating layout OK on desktop |
| `src/components/Portfolio.tsx` | Placeholder state clear |
| `src/components/Contact.tsx` | Good external link hygiene (`rel="noopener noreferrer"`) |
| `src/components/Footer.tsx` | Only server component; `new Date().getFullYear()` is fine here |
| `src/components/Stats.tsx` | Should align numbers with `profile` |
| `src/components/TechMarquee.tsx` | Could be server + CSS-only (no client hook needed) |

---

## Remedial actions summary

Prioritized checklist. **No code was changed** as part of this review; implement in order that matches your deployment timeline.

### P0 — Before public deployment

| ID | Action | Owner effort |
|----|--------|--------------|
| R-01 | Add rate limiting and per-IP quotas on `POST /api/chat` | Medium |
| R-02 | Server accepts **user** messages only; strip client `assistant` roles | Small |
| R-03 | Enforce max message length and request body size on API | Small |
| R-04 | Fix `npm run lint` failures (ID generation / lint config) | Small |
| R-05 | Confirm API key not in git history; rotate if exposed | Small |

### P1 — Soon after launch

| ID | Action | Owner effort |
|----|--------|--------------|
| R-06 | Chat modal: focus trap, Escape, `role="dialog"`, `aria-live` | Medium |
| R-07 | Add `AbortController` on chat fetch; cleanup on unmount | Small |
| R-08 | Hide floating chat FAB on `lg` when inline chat visible | Trivial |
| R-09 | Align `Stats` / marquee with `profile` data | Small |
| R-10 | Resolve overlapping job dates in `profile.ts` | Small (content) |
| R-11 | Add `.env.example` and deployment docs for `OPENROUTER_API_KEY` | Trivial |

### P2 — Quality and maintainability

| ID | Action | Owner effort |
|----|--------|--------------|
| R-12 | Split `DigitalTwin.tsx` + `useDigitalTwinChat` hook | Medium |
| R-13 | Reduce client components / lazy-load chat | Medium |
| R-14 | Add unit tests for prompt, SSE parser, API validation | Medium |
| R-15 | Add Playwright smoke test for chat | Medium |
| R-16 | CI: `lint` + `build` on PR | Small |
| R-17 | Cache system prompt string | Trivial |
| R-18 | Tailwind theme tokens instead of raw hex | Medium |

### P3 — Nice to have

| ID | Action | Owner effort |
|----|--------|--------------|
| R-19 | `sitemap.ts`, `robots.ts`, JSON-LD Person schema | Small |
| R-20 | Open Graph image and canonical URL | Small |
| R-21 | Bundle analyzer + motion/CSS audit | Medium |
| R-22 | `prefers-reduced-motion` for Framer Motion | Small |
| R-23 | Gitignore `linkedin.pdf` or move out of repo | Trivial |

---

## What is already done well

1. **Secret handling** — OpenRouter key stays server-side; streaming proxy avoids exposing the key to the browser.
2. **Content architecture** — `profile.ts` powers UI and AI prompt from one place.
3. **AI guardrails** — System prompt restricts scope and forbids inventing employers.
4. **Input basics** — Role filtering, empty-message drop, last-20-message cap.
5. **UX** — Streaming replies, starter prompts, loading states, error display.
6. **Visual cohesion** — Consistent palette, typography, and section rhythm.
7. **Production build** — TypeScript strict mode; `npm run build` succeeds.
8. **External links** — `rel="noopener noreferrer"` on LinkedIn targets.

---

## Conclusion

The project successfully meets its goals: a distinctive portfolio and a working Digital Twin. The codebase is readable and appropriate for learning and personal branding. The main gap between “works on localhost” and “safe on the public internet” is **protecting `/api/chat`** from abuse and **hardening chat history trust boundaries**. Address P0 items before sharing widely or indexing the site; use P1–P2 to improve accessibility, maintainability, and long-term quality.

---

*End of review. This document is descriptive only; implementing remedial actions is left to a future change set.*
