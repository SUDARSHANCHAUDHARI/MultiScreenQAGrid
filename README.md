# MultiScreen QA Grid

Visual QA monitoring wall for many screens at once

## What it is

Live dashboard for QA and support teams to monitor many signage screens in one place with AI anomaly detection and visual health monitoring.

## Features

- Live screen wall view
- Latest screenshot per screen
- AI anomaly detection
- Platform and location filters
- Health status badges
- Fullscreen monitoring mode
- Screenshot history
- Incident creation

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Socket.IO / Liveblocks
- OpenAI Vision / Claude Vision
- PostgreSQL
- Redis

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Optional AI environment variables are documented in `.env.example`:

```bash
AI_PROVIDER=claude
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

The current demo uses in-memory screen data and API routes. It is suitable for a public prototype, not a real production monitoring wall yet.

## Deployment

Release scope: public demo. Real production still needs persistent screen ingestion, auth, incident workflow, and monitoring.

Recommended first deployment target:

- Cloudflare Pages

Suggested environment:

- standalone project
- one deployment per repo
- production branch: `main`
- framework preset: `Next.js`
- build command: `pnpm build:cloudflare`
- build output directory: `.vercel/output/static`
- Node version: `20.19.6`

Use the normal `pnpm build` and `pnpm typecheck` commands for local verification before deployment.

## License

MIT
