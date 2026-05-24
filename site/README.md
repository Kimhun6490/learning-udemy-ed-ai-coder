# Kimhun Malai — Professional Site

Enterprise-meets-edgy personal site built with Next.js, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Digital Twin (AI chat)

The site includes a career chatbot powered by [OpenRouter](https://openrouter.ai) using `openai/gpt-oss-120b`.

1. Add your key to `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-...
   ```
2. Run `npm run dev` and open the **Digital Twin** section or the floating chat button.

## Customize

Edit `src/data/profile.ts` to update copy, experience, skills, and portfolio placeholders. The Digital Twin system prompt is built from this file in `src/lib/digital-twin-prompt.ts`.
