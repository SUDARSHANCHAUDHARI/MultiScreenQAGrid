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

## License

MIT

- [About](#about)

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
