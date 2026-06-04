# MultiScreen QA Grid

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Release](https://img.shields.io/badge/release-public%20demo-orange.svg)](RELEASE_MEMORY.md)

Visual QA monitoring wall for inspecting many screens at once, with demo concepts for anomaly detection, screen health, comparison, and heatmap views.

> **Status:** Public demo-ready · build verified · real production requires persistent screen ingestion, auth, incident workflow, and monitoring

## Contents

1. [Why This Exists](#why-this-exists)
2. [Status](#status)
3. [Key Technical Decisions](#key-technical-decisions)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Verification](#verification)
9. [Known Limits](#known-limits)
10. [Author](#author)

## Why This Exists

When QA or support teams monitor many screens, they need fast visual scanning: what is healthy, what changed, what looks anomalous, and where attention should go first. MultiScreen QA Grid turns that workflow into a browser-first demo.

## Status

| Item | State |
|---|---|
| Release type | Public demo |
| Production app | Not yet |
| Data model | In-memory demo screen data |
| Deployment target | Cloudflare Pages |
| Last verified | 2026-06-04 |

Verified checks:

```bash
pnpm build
pnpm typecheck
```

## Key Technical Decisions

**Next.js 16 is used for the dashboard and API routes.** The app combines visual pages with route handlers for screen, compare, heatmap, and anomaly concepts.

**Demo data is in-memory by design.** It keeps the public prototype simple and makes the real production gaps clear instead of hiding missing ingestion/persistence work.

**AI provider keys are optional demo configuration.** The app documents Anthropic/OpenAI values, but real visual analysis behavior needs production smoke testing.

**Cloudflare Pages is the first deployment target.** The repo includes `build:cloudflare`, `.nvmrc`, static headers, and accepted Next 16 TypeScript normalization.

## Features

- dashboard screen wall
- screen detail concepts
- compare view
- heatmap view
- anomaly API route concept
- health/status badges
- optional AI provider configuration
- Cloudflare Pages demo deployment setup

## Getting Started

```bash
pnpm install
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

## Deployment

Release scope: public demo.

Cloudflare Pages settings:

| Setting | Value |
|---|---|
| Framework preset | `Next.js` |
| Build command | `pnpm build:cloudflare` |
| Build output directory | `.vercel/output/static` |
| Node version | `20.19.6` |
| Production branch | `main` |

## Verification

```bash
pnpm build
pnpm typecheck
```

Before promoting beyond demo, smoke-test dashboard, compare, heatmap, screen detail, and API routes.

## Known Limits

- No live screen ingestion yet.
- No persistent screen history yet.
- No authentication or incident ownership model yet.
- Monitoring/alerting workflows are conceptual in the demo.

## Author

Built by **Sudarshan Chaudhari** — SudarshanTechLabs.

## License

MIT
