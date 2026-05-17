Project 14: MultiScreen QA Grid
Visual QA monitoring wall for many screens at once
Core idea

MultiScreen QA Grid is a live dashboard for QA and support teams to monitor many signage screens in one place.

Instead of checking one device at a time, users see:

all screens
latest screenshots
health status
platform
location
release version
visual issues
offline state
content mismatch

Think:

Security camera wall + Datadog + AI visual QA
for digital signage fleets.
Tech stack
Frontend:
Next.js 15
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Recharts

Backend:
Node.js
Fastify / Next.js API routes

Realtime:
Socket.IO / Liveblocks / Supabase Realtime

AI:
OpenAI Vision / Claude Vision

Database:
PostgreSQL
Prisma

Queue:
BullMQ
Redis

Storage:
Cloudflare R2 / S3

Deployment:
Vercel
Railway
Supabase / Neon
Upstash Redis
Repo structure
multiscreen-qa-grid/
  apps/
    web/
      app/
        page.tsx
        dashboard/
        grid/
        grid/[id]/
        screens/
        screens/[id]/
        incidents/
        reports/
        settings/
        api/
      components/
        grid/
          screen-wall.tsx
          screen-tile.tsx
          grid-filters.tsx
          platform-filter.tsx
          anomaly-badge.tsx
          fullscreen-grid.tsx
        screens/
          screen-detail-drawer.tsx
          screenshot-history.tsx
          screen-health-card.tsx
        incidents/
        dashboard/
        layout/
        marketing/
      lib/
        api.ts
        auth.ts
        realtime.ts
      package.json

    agent/
      src/
        capture/
          screenshot.ts
        services/
          heartbeat.ts
          upload.ts
          config.ts
        index.ts
      package.json

    worker/
      src/
        jobs/
          analyze-screen.job.ts
          detect-anomaly.job.ts
          update-grid.job.ts
        services/
          vision-analyzer.ts
          anomaly-detector.ts
          grid-health.ts
          notification-service.ts
        index.ts
      package.json

  packages/
    database/
      prisma/
        schema.prisma
      src/
        client.ts

    shared/
      src/
        types.ts
        screen-status.ts
        grid-layout.ts

    ui/
      components/
      styles/

  docs/
    product-spec.md
    mvp-roadmap.md
    agent-design.md
    ai-prompts.md
    realtime-architecture.md

  infra/
    docker-compose.yml
    railway.json
    vercel.json

  .env.example
  package.json
  pnpm-workspace.yaml
  README.md
Main features
1. Live screen wall
2. Latest screenshot per screen
3. Screen status badges
4. Platform filters
5. Location filters
6. Release version filters
7. AI anomaly detection
8. Black screen detection
9. Stale screenshot detection
10. Content mismatch detection
11. Fullscreen monitoring mode
12. Screen detail drawer
13. Screenshot history
14. Incident creation
15. Team review mode
Database schema
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  grids     Grid[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Grid {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  screens     Screen[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model Screen {
  id          String       @id @default(cuid())
  gridId      String
  name        String
  location    String?
  platform    String?
  appVersion  String?
  status      ScreenStatus @default(UNKNOWN)
  healthScore Int?
  lastSeenAt  DateTime?
  screenshots Screenshot[]
  incidents   Incident[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  grid Grid @relation(fields: [gridId], references: [id])
}

model Screenshot {
  id          String   @id @default(cuid())
  screenId    String
  imageUrl    String
  aiSummary   String?
  healthScore Int?
  metadata    Json?
  createdAt   DateTime @default(now())

  screen Screen @relation(fields: [screenId], references: [id])
}

model Incident {
  id          String   @id @default(cuid())
  screenId    String
  type        String
  severity    String
  status      String   @default("OPEN")
  summary     String?
  evidenceUrl String?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  screen Screen @relation(fields: [screenId], references: [id])
}

enum ScreenStatus {
  ONLINE
  OFFLINE
  WARNING
  CRITICAL
  UNKNOWN
}
Monitoring flow
Agent captures screenshot
↓
Screenshot uploaded
↓
Grid updates latest thumbnail
↓
Worker analyzes image
↓
AI detects anomalies
↓
Screen health score updates
↓
Incident created if needed
↓
Realtime dashboard updates
AI anomaly prompt
You are an expert QA analyst for digital signage screens.

Analyze this screen screenshot.

Detect:
1. black screen
2. blank screen
3. loading spinner
4. browser error
5. iframe error
6. wrong orientation
7. distorted layout
8. missing content
9. unreadable text
10. frozen-looking content
11. content mismatch

Return JSON:
{
  "status": "healthy | warning | critical",
  "healthScore": 0-100,
  "summary": "",
  "issues": [],
  "incidentType": "",
  "recommendedAction": ""
}
Dashboard layout
Top:
total screens
online screens
critical screens
warnings
latest release version

Main:
large responsive screen grid

Each tile:
latest screenshot
screen name
platform
location
health score
status badge
last seen

Right drawer:
selected screen details
screenshot history
AI summary
open incidents
MVP pages
/
/dashboard
/grid
/screens
/screens/[id]
/incidents
/reports
/settings
MVP build order
Phase 1:
- Create grid
- Add screens manually
- Upload screenshots manually
- Display screen wall

Phase 2:
- AI anomaly analysis
- health score
- incident creation

Phase 3:
- lightweight agent
- automatic screenshot upload
- realtime updates

Phase 4:
- filters
- team mode
- alerting
- billing
Monetization
Free:
10 screens
manual upload

Pro:
$29/month
100 screens
AI anomaly detection
history

Team:
$149/month
500 screens
team dashboard
alerts
realtime monitoring

Enterprise:
custom
large fleets
private deployment
SSO
audit logs
Viral demo idea
“Monitor 100 signage screens in one grid.
AI highlights the ones that actually look broken.”
Best MVP version

Build this first:

Manual screenshot upload
↓
screen grid
↓
AI health score
↓
incident badge

Do not start with realtime agent first.