import type { Screen, ScreenGroup, Anomaly, ReleaseComparison } from "./types";

// In-memory store — module-level Maps (server-side singleton)
export const screensMap = new Map<string, Screen>();
export const groupsMap = new Map<string, ScreenGroup>();
export const anomaliesMap = new Map<string, Anomaly>();
export const comparisonsMap = new Map<string, ReleaseComparison>();

// Seed with demo data so the UI has something to show on first load
function seed() {
  if (screensMap.size > 0) return;

  const platforms = [
    "SCOS",
    "Android",
    "FireOS",
    "Tizen",
    "webOS",
    "Windows",
    "ChromeOS",
    "iOS",
  ] as const;
  const statuses = ["OK", "WARNING", "CRITICAL", "OFFLINE"] as const;
  const locations = [
    "London HQ",
    "NYC Office",
    "Bangkok Office",
    "Singapore HQ",
    "Sydney Branch",
  ];

  for (let i = 1; i <= 50; i++) {
    const id = `screen-${i}`;
    const platform = platforms[i % platforms.length];
    const status = statuses[i % statuses.length];
    const location = locations[i % locations.length];

    screensMap.set(id, {
      id,
      name: `Screen-${String(i).padStart(3, "0")}`,
      platform,
      status,
      lastSeen: new Date(Date.now() - i * 60_000).toISOString(),
      metadata: {
        resolution: "1920x1080",
        location,
        firmware: `v2.${i % 5}.${i % 10}`,
      },
    });
  }

  // Seed a couple of anomalies
  const anomalyTypes = [
    "OFFLINE",
    "PERFORMANCE",
    "VISUAL",
    "SYNC",
  ] as const;
  const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

  for (let i = 1; i <= 10; i++) {
    const id = `anomaly-${i}`;
    const screen = screensMap.get(`screen-${i}`);
    if (!screen) continue;
    anomaliesMap.set(id, {
      id,
      screenId: screen.id,
      screenName: screen.name,
      type: anomalyTypes[i % anomalyTypes.length],
      severity: severities[i % severities.length],
      description: `Auto-detected ${anomalyTypes[i % anomalyTypes.length].toLowerCase()} issue on ${screen.name}`,
      detectedAt: new Date(Date.now() - i * 120_000).toISOString(),
    });
  }
}

seed();
