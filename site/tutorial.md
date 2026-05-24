# Building a Professional Portfolio with Next.js — A Beginner's Tutorial

This tutorial explains how your personal portfolio website was built: a single-page site with sections for your career story, plus an AI **Digital Twin** chatbot powered by OpenRouter. It is written for someone new to frontend development.

---

## Table of contents

1. [What you built](#what-you-built)
2. [Technology summary](#technology-summary)
3. [Prerequisites](#prerequisites)
4. [Project structure](#project-structure)
5. [High-level walkthrough](#high-level-walkthrough)
6. [How the site runs locally](#how-the-site-runs-locally)
7. [Detailed code review](#detailed-code-review)
8. [Five ways the code could be improved](#five-ways-the-code-could-be-improved)

---

## What you built

You have a **professional portfolio website** that:

- Introduces you (name, title, location, tagline)
- Shows your **About** story and education
- Displays a **Career Journey** timeline (jobs from your LinkedIn PDF)
- Reserves space for a future **Portfolio**
- Offers a **Contact** section
- Includes a **Digital Twin** — an AI chat that answers questions about your career in your voice

The visual style is **“enterprise meets edgy”**: dark backgrounds, teal accents, sharp typography, subtle animations, and glass-style cards.

---

## Technology summary

| Technology | What it is | Why we use it |
|------------|------------|---------------|
| **Next.js 16** | A React framework for building web apps | Handles routing, builds, and API routes in one project |
| **React 19** | A JavaScript library for building UIs with reusable **components** | Every section (Hero, About, Chat) is a component |
| **TypeScript** | JavaScript with **types** (e.g. `string`, `{ name: string }`) | Catches mistakes before you run the app |
| **Tailwind CSS 4** | Utility classes for styling (`text-sm`, `bg-[#00e5c2]`) | Fast styling without writing lots of custom CSS files |
| **Framer Motion** | Animation library for React | Fade-ins, slide-up panels, smooth chat open/close |
| **Lucide React** | Icon components (`Mail`, `Bot`, `Send`) | Consistent icons without image files |
| **OpenRouter** | API gateway to many AI models | Calls `openai/gpt-oss-120b` for the Digital Twin |
| **Node.js** | JavaScript runtime on the server | Runs Next.js and the `/api/chat` route |

### Key concepts for beginners

- **Component**: A reusable piece of UI (e.g. `<Hero />`, `<Header />`).
- **Props**: Data passed *into* a component from its parent.
- **State**: Data that changes over time inside a component (e.g. chat messages, menu open/closed).
- **Server vs client**:
  - **Server components** run on the server when the page loads (good for SEO, no browser APIs).
  - **Client components** (marked with `"use client"`) run in the browser and can use `useState`, clicks, scrolling.
- **API route**: A server endpoint (e.g. `POST /api/chat`) that your frontend calls; secrets like API keys stay on the server.

---

## Prerequisites

To work with this project you need:

1. **Node.js** installed (v18+ recommended)
2. A terminal
3. An **OpenRouter API key** in `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

Commands you will use often:

```bash
npm install    # Install dependencies (first time)
npm run dev    # Start development server
npm run build  # Create production build
npm start      # Run production build
```

---

## Project structure

```
site/
├── .env                    # Secret API key (never commit to git)
├── package.json            # Dependencies and scripts
├── tutorial.md             # This file
├── public/                 # Static files (if any)
└── src/
    ├── app/                # Next.js App Router
    │   ├── layout.tsx      # Wraps every page (fonts, metadata)
    │   ├── page.tsx        # Home page — assembles all sections
    │   ├── globals.css     # Global styles, colors, animations
    │   ├── icon.svg        # Browser tab icon
    │   └── api/
    │       └── chat/
    │           └── route.ts    # Digital Twin API (OpenRouter)
    ├── components/         # UI building blocks
    │   ├── Header.tsx
    │   ├── Hero.tsx
    │   ├── About.tsx
    │   ├── Journey.tsx
    │   ├── Portfolio.tsx
    │   ├── DigitalTwin.tsx
    │   ├── Contact.tsx
    │   └── ...
    ├── data/
    │   └── profile.ts      # All your text & career data (single source of truth)
    └── lib/
        └── digital-twin-prompt.ts   # Builds AI system prompt from profile
```

**Design principle:** Put content in `profile.ts`. Components **read** that file instead of hard-coding your name or jobs in many places.

---

## High-level walkthrough

Here is what happens when someone visits your site:

```
Browser requests http://localhost:3000
        │
        ▼
Next.js loads app/layout.tsx  (fonts, <html>, <body>)
        │
        ▼
Next.js loads app/page.tsx    (Home page)
        │
        ├── Header (navigation, scroll effect)
        ├── Hero (big intro)
        ├── TechMarquee (scrolling skill names)
        ├── Stats (years, companies, etc.)
        ├── About
        ├── Journey (timeline)
        ├── Portfolio (coming soon cards)
        ├── DigitalTwin (chat UI)
        ├── Contact
        └── Footer
```

When someone **sends a chat message**:

```
User types in DigitalTwin.tsx (browser)
        │
        ▼
fetch("/api/chat", { messages: [...] })   ← browser calls YOUR server
        │
        ▼
app/api/chat/route.ts
        ├── Reads OPENROUTER_API_KEY from .env
        ├── Builds system prompt from profile.ts
        └── Forwards request to OpenRouter (stream: true)
        │
        ▼
Stream of text chunks flows back to browser
        │
        ▼
DigitalTwin updates the assistant message word-by-word
```

**Important:** The OpenRouter key never goes to the browser. Only your Next.js server talks to OpenRouter.

---

## How the site runs locally

1. Open a terminal in the `site` folder.
2. Run `npm run dev`.
3. Open the URL shown (often `http://localhost:3000` or `3001` if 3000 is busy).
4. Edit a file → save → the page **hot-reloads** automatically.

In development, Next.js compiles TypeScript and React on the fly. In production (`npm run build` then `npm start`), pages are pre-built for speed.

---

## Detailed code review

### 1. The data layer — `src/data/profile.ts`

All portfolio content lives in one object. This makes updates easy: change your job here, and Hero, About, Journey, and the AI twin all stay in sync.

```typescript
export const profile = {
  name: "Kimhun Malai",
  title: "Software Engineer",
  location: "Bangkok, Thailand",
  email: "kimhunmalai@gmail.com",
  linkedin: "https://www.linkedin.com/in/kimhun-malai-7605041aa",
  tagline: "Building reliable systems across mobile, web, and backend...",
  about: [
    "I'm a software engineer based in Bangkok...",
    // more paragraphs
  ],
  skills: [
    { name: "Vue.js", category: "Frontend" },
    { name: "Nuxt", category: "Frontend" },
    // ...
  ],
  experience: [
    {
      company: "Zimpligital",
      role: "Software Engineer",
      period: "Aug 2024 — Present",
      description: "Full-stack development...",
      highlight: true,  // marks "current" job in the UI
    },
    // more jobs
  ],
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  // ...
];
```

**Beginner note:** `export` means other files can `import` this data. The `#about` links scroll to sections with `id="about"` on the page.

---

### 2. Root layout — `src/app/layout.tsx`

Every page is wrapped by `layout.tsx`. Here it:

- Loads **Google fonts** (DM Sans, Syne, JetBrains Mono)
- Sets **SEO metadata** (title, description for Google/social sharing)
- Applies font CSS variables to `<html>`

```typescript
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kimhun Malai — Software Engineer",
  description: "Software engineer in Bangkok...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ...`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
```

`children` is whatever page is being shown (here, `page.tsx`).

---

### 3. Home page — `src/app/page.tsx`

This file does **not** contain much HTML. It **composes** components like building blocks:

```typescript
import { About } from "@/components/About";
import { DigitalTwin } from "@/components/DigitalTwin";
import { Hero } from "@/components/Hero";
// ... other imports

export default function Home() {
  return (
    <div className="noise relative min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <TechMarquee />
        <Stats />
        <About />
        <Journey />
        <Portfolio />
        <DigitalTwin />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
```

The `@/` prefix is an alias for `src/` (configured in Next.js). Order here = order on the page.

---

### 4. Global styles — `src/app/globals.css`

Tailwind is imported at the top. Custom **CSS variables** define the design system:

```css
:root {
  --bg-deep: #06080c;
  --text-primary: #f4f6fa;
  --text-muted: #8b95a8;
  --accent: #00e5c2;      /* teal */
  --accent-hot: #ff3366;  /* magenta highlight */
}
```

Utility classes used in components often reference these colors directly, e.g. `text-[#00e5c2]`.

Special effects:

- **`.grid-bg`** — faint grid behind the hero
- **`.noise`** — subtle texture overlay
- **`.gradient-border`** — gradient outline on cards
- **`.animate-marquee`** — infinite horizontal scroll for tech names

---

### 5. A typical section — `src/components/Hero.tsx`

Hero is a **client component** because it uses Framer Motion animations:

```typescript
"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center ...">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>
          {profile.name.split(" ")[0]}
          <span className="bg-gradient-to-r from-[#00e5c2] ... bg-clip-text text-transparent">
            {profile.name.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p>{profile.tagline}</p>
      </motion.div>
    </section>
  );
}
```

**Patterns to notice:**

- Data comes from `profile`, not hard-coded strings
- Tailwind classes control layout and color
- `motion.div` animates on first paint

---

### 6. Interactive header — `src/components/Header.tsx`

The header uses **React state** and **effects**:

```typescript
"use client";

import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "border-b bg-[#06080c]/80 backdrop-blur-xl" : "bg-transparent"}>
      {/* nav links from navLinks.map(...) */}
    </header>
  );
}
```

- `useState(false)` — `scrolled` starts `false`; becomes `true` after scrolling 24px
- `useEffect` — runs in the browser after render; adds/removes scroll listener
- Mobile menu toggles with `open` / `setOpen`

---

### 7. Digital Twin system prompt — `src/lib/digital-twin-prompt.ts`

Before calling the AI, the server builds instructions from your profile:

```typescript
import { profile } from "@/data/profile";

export function buildDigitalTwinSystemPrompt(): string {
  const experienceBlock = profile.experience
    .map((job) => `- ${job.role} at ${job.company} (${job.period}). ${job.description}`)
    .join("\n");

  return `You are the Digital Twin of ${profile.name}...
Speak in first person as Kimhun ("I", "my").
## Facts you may use (only these — do not invent employers...)
**Career history:**
${experienceBlock}
## Rules
- Answer only about Kimhun's career...
- Never fabricate projects...`;
}

export const OPENROUTER_MODEL = "openai/gpt-oss-120b";
```

This is called a **system prompt**. It keeps the AI on-topic and grounded in real data.

---

### 8. API route — `src/app/api/chat/route.ts`

Next.js treats `route.ts` as an HTTP endpoint. Only **POST** is implemented:

```typescript
export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
  }

  const body = await request.json();
  const sanitized = body.messages
    .filter(/* only valid user/assistant strings */)
    .slice(-20);  // last 20 messages max

  const openRouterMessages = [
    { role: "system", content: buildDigitalTwinSystemPrompt() },
    ...sanitized,
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Kimhun Malai Digital Twin",  // must be ASCII-only
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: openRouterMessages,
      stream: true,
      max_tokens: 1024,
    }),
  });

  // Pass the stream straight through to the browser
  return new Response(response.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

**Security checklist:**

| Good practice | How this project does it |
|---------------|---------------------------|
| Hide API key | Key only in `.env`, read via `process.env` on server |
| Validate input | Filters roles and empty messages |
| Limit history | `.slice(-20)` prevents huge requests |
| Error handling | Returns JSON errors with HTTP status codes |

---

### 9. Chat UI — `src/components/DigitalTwin.tsx`

The chat component is the most complex frontend file. Main ideas:

**State:**

```typescript
const [messages, setMessages] = useState<Message[]>([
  { id: "welcome", role: "assistant", content: "Hey — I'm Kimhun's Digital Twin..." },
]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
```

**Sending a message:**

```typescript
async function sendMessage(text: string) {
  const userMsg = { id: `user-${Date.now()}`, role: "user", content: text };
  const apiHistory = [...toApiHistory(messages), { role: "user", content: text }];

  setMessages((prev) => [...prev, userMsg]);
  setLoading(true);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: apiHistory }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += parseSseChunk(decoder.decode(value, { stream: true }));
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
    );
  }
}
```

**Parsing streamed AI output (SSE):**

OpenRouter sends **Server-Sent Events** — lines like `data: {"choices":[{"delta":{"content":"Hello"}}]}`.

```typescript
function parseSseChunk(chunk: string): string {
  let text = "";
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") continue;
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) text += delta;
    } catch { /* skip bad lines */ }
  }
  return text;
}
```

**Two UIs, one state:**

- **Desktop:** embedded chat in the `#twin` section (`hidden lg:flex`)
- **Mobile / floating button:** modal panel (`AnimatePresence` + `motion.div`)

Both share the same `messages` state so the conversation continues regardless of where you chat.

---

### 10. Journey timeline — `src/components/Journey.tsx`

The career section **maps** over `profile.experience`:

```typescript
{profile.experience.map((job, index) => (
  <motion.article key={`${job.company}-${job.role}-${job.period}`}>
    {job.highlight && <span>Current</span>}
    <h3>{job.role}</h3>
    <p>{job.company}</p>
    <p>{job.description}</p>
  </motion.article>
))}
```

`.map()` is how React renders a list: one card per job. `key` helps React track which item is which when the list changes.

---

## Five ways the code could be improved

These are honest follow-ups from a self-review — not bugs, but sensible next steps as you grow as a developer.

### 1. Split `DigitalTwin.tsx` into smaller files

`DigitalTwin.tsx` is large (~400 lines) and handles section layout, modal, streaming, and message bubbles. Extracting `ChatMessages`, `ChatInput`, `MessageBubble`, and `useDigitalTwinChat()` (a custom hook) would make each file easier to read and test.

### 2. Add rate limiting and abuse protection on `/api/chat`

Anyone who can load your site can call `/api/chat`, which spends your OpenRouter credits. Improvements: rate limit by IP (e.g. with `@upstash/ratelimit`), cap message length on the server, and optionally require a simple captcha or auth for production.

### 3. Replace inline color hex codes with design tokens in Tailwind

Many components use raw values like `text-[#8b95a8]` instead of theme tokens such as `text-muted`. Extending Tailwind’s theme in `globals.css` (e.g. `colors: { muted: "var(--text-muted)" }`) would make rebranding one change instead of dozens.

### 4. Add automated tests

There are no unit or integration tests yet. High-value targets:

- `buildDigitalTwinSystemPrompt()` includes every job from `profile.experience`
- `/api/chat` returns 400 for bad input and 500 when the API key is missing
- `parseSseChunk()` correctly extracts content from sample SSE strings

Tools: **Vitest** for units, **Playwright** for “page loads and chat sends a message.”

### 5. Improve accessibility (a11y)

The site is visually strong but could be stronger for screen readers and keyboard users: focus traps in the chat modal, `aria-live` regions for streaming replies, visible focus rings on all interactive elements, and reduced-motion respect (partially done in CSS for the marquee). A quick audit with Lighthouse or axe DevTools would highlight specific fixes.

---

## Quick reference — files to edit for common tasks

| Task | File |
|------|------|
| Change your name, jobs, skills | `src/data/profile.ts` |
| Change AI behavior / rules | `src/lib/digital-twin-prompt.ts` |
| Change AI model | `OPENROUTER_MODEL` in `digital-twin-prompt.ts` |
| Change colors / fonts | `src/app/globals.css`, `src/app/layout.tsx` |
| Add a new page section | New component in `src/components/`, import in `page.tsx` |
| Change API logic | `src/app/api/chat/route.ts` |

---

## Glossary

| Term | Meaning |
|------|---------|
| **JSX** | HTML-like syntax inside JavaScript/TypeScript |
| **Hook** | Functions like `useState`, `useEffect` that add behavior to components |
| **SSE** | Server-Sent Events — streaming text from server to browser |
| **SSR** | Server-Side Rendering — HTML generated on the server |
| **.env** | File for secrets; loaded by Next.js, ignored by git |

---

## What to learn next

1. **React basics** — components, props, state, lists, forms  
2. **TypeScript basics** — types, interfaces, `import`/`export`  
3. **Next.js docs** — App Router, layouts, API routes  
4. **Tailwind docs** — responsive design (`sm:`, `lg:`), flexbox, grid  
5. **Deploy** — Vercel is the easiest host for Next.js; set `OPENROUTER_API_KEY` in the dashboard  

You now have a working, modern portfolio with a real AI feature. Treat this repo as a living project: update `profile.ts` as your career grows, and tackle the five improvements above when you are ready.
