"use client";

import { useState, useEffect, useCallback } from "react";
import type { Screen, Platform, ScreenStatus, Anomaly } from "@/lib/types";

type Density = 50 | 100 | 500;

const ALL_PLATFORMS: Platform[] = [
  "SCOS",
  "Android",
  "FireOS",
  "Tizen",
  "webOS",
  "Windows",
  "ChromeOS",
  "iOS",
];

const STATUS_COLORS: Record<ScreenStatus, string> = {
  OK: "bg-green-500",
  WARNING: "bg-yellow-500",
  CRITICAL: "bg-red-500",
  OFFLINE: "bg-gray-600",
};

const STATUS_RING: Record<ScreenStatus, string> = {
  OK: "ring-green-500",
  WARNING: "ring-yellow-500",
  CRITICAL: "ring-red-500",
  OFFLINE: "ring-gray-600",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  SCOS: "bg-blue-900 text-blue-300",
  Android: "bg-green-900 text-green-300",
  FireOS: "bg-orange-900 text-orange-300",
  Tizen: "bg-cyan-900 text-cyan-300",
  webOS: "bg-purple-900 text-purple-300",
  Windows: "bg-sky-900 text-sky-300",
  ChromeOS: "bg-yellow-900 text-yellow-300",
  iOS: "bg-pink-900 text-pink-300",
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [density, setDensity] = useState<Density>(50);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [screensRes, anomaliesRes] = await Promise.all([
        fetch("/api/screens"),
        fetch("/api/anomalies"),
      ]);
      if (!screensRes.ok || !anomaliesRes.ok) throw new Error("Fetch failed");
      const [screensData, anomaliesData] = await Promise.all([
        screensRes.json() as Promise<Screen[]>,
        anomaliesRes.json() as Promise<Anomaly[]>,
      ]);
      setScreens(screensData);
      setAnomalies(anomaliesData);
      setError(null);
    } catch {
      setError("Failed to load screens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => void fetchData(), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAnomalyDetection = async () => {
    setDetecting(true);
    try {
      const res = await fetch("/api/anomalies", { method: "POST" });
      if (!res.ok) throw new Error("Detection failed");
      await fetchData();
    } catch {
      setError("AI anomaly detection failed");
    } finally {
      setDetecting(false);
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const anomalyCountByScreen = new Map<string, number>();
  for (const a of anomalies) {
    anomalyCountByScreen.set(a.screenId, (anomalyCountByScreen.get(a.screenId) ?? 0) + 1);
  }

  const filteredScreens =
    selectedPlatforms.size === 0
      ? screens
      : screens.filter((s) => selectedPlatforms.has(s.platform));

  // Group by location (metadata.location)
  const groups = new Map<string, Screen[]>();
  for (const s of filteredScreens) {
    const loc = s.metadata.location ?? "Unknown";
    const group = groups.get(loc) ?? [];
    group.push(s);
    groups.set(loc, group);
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-white">Screen Wall</h1>
        <span className="text-sm text-gray-500">
          {filteredScreens.length} screens
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Density toggle */}
          <span className="text-xs text-gray-500">Density:</span>
          {([50, 100, 500] as Density[]).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                density === d
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {d}
            </button>
          ))}

          {/* AI detect button */}
          <button
            onClick={() => void triggerAnomalyDetection()}
            disabled={detecting}
            className="rounded bg-purple-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
          >
            {detecting ? "Detecting…" : "AI Detect"}
          </button>

          {/* Refresh */}
          <button
            onClick={() => void fetchData()}
            className="rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Platform filter chips */}
      <div className="flex flex-wrap gap-2">
        {ALL_PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedPlatforms.has(p)
                ? PLATFORM_COLORS[p]
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {p}
          </button>
        ))}
        {selectedPlatforms.size > 0 && (
          <button
            onClick={() => setSelectedPlatforms(new Set())}
            className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300 hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading screens…</div>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([location, groupScreens]) => (
            <div key={location}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {location} — {groupScreens.length} screens
              </h2>
              <ScreenGrid
                screens={groupScreens}
                density={density}
                anomalyCountByScreen={anomalyCountByScreen}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenGrid({
  screens,
  density,
  anomalyCountByScreen,
}: {
  screens: Screen[];
  density: Density;
  anomalyCountByScreen: Map<string, number>;
}) {
  if (density === 500) {
    return <TinyDotGrid screens={screens} anomalyCountByScreen={anomalyCountByScreen} />;
  }
  if (density === 100) {
    return <SmallCardGrid screens={screens} anomalyCountByScreen={anomalyCountByScreen} />;
  }
  return <LargeCardGrid screens={screens} anomalyCountByScreen={anomalyCountByScreen} />;
}

// Density 50 — larger cards
function LargeCardGrid({
  screens,
  anomalyCountByScreen,
}: {
  screens: Screen[];
  anomalyCountByScreen: Map<string, number>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {screens.map((screen) => (
        <LargeScreenCard
          key={screen.id}
          screen={screen}
          anomalyCount={anomalyCountByScreen.get(screen.id) ?? 0}
        />
      ))}
    </div>
  );
}

function LargeScreenCard({
  screen,
  anomalyCount,
}: {
  screen: Screen;
  anomalyCount: number;
}) {
  return (
    <div
      className={`relative rounded-lg border bg-gray-900 p-3 transition-colors ${
        screen.status === "CRITICAL"
          ? "border-red-700"
          : screen.status === "WARNING"
          ? "border-yellow-700"
          : screen.status === "OFFLINE"
          ? "border-gray-700"
          : "border-gray-800"
      }`}
    >
      {/* Screenshot placeholder */}
      <div className="mb-2 aspect-video w-full overflow-hidden rounded bg-gray-800">
        {screen.screenshotBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/jpeg;base64,${screen.screenshotBase64}`}
            alt={screen.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Status dot + name */}
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_COLORS[screen.status]}`}
        />
        <span className="truncate text-xs font-medium text-gray-200">
          {screen.name}
        </span>
      </div>

      {/* Platform badge */}
      <span
        className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${PLATFORM_COLORS[screen.platform]}`}
      >
        {screen.platform}
      </span>

      {/* Last seen */}
      <p className="mt-1 text-[10px] text-gray-600">{timeAgo(screen.lastSeen)}</p>

      {/* Anomaly badge */}
      {anomalyCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
          {anomalyCount > 9 ? "9+" : anomalyCount}
        </span>
      )}
    </div>
  );
}

// Density 100 — small cards
function SmallCardGrid({
  screens,
  anomalyCountByScreen,
}: {
  screens: Screen[];
  anomalyCountByScreen: Map<string, number>;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-16">
      {screens.map((screen) => (
        <div
          key={screen.id}
          title={`${screen.name} — ${screen.status} — ${screen.platform}`}
          className={`relative rounded border p-1.5 ${
            screen.status === "CRITICAL"
              ? "border-red-700 bg-red-950/30"
              : screen.status === "WARNING"
              ? "border-yellow-700 bg-yellow-950/30"
              : screen.status === "OFFLINE"
              ? "border-gray-700 bg-gray-900"
              : "border-gray-800 bg-gray-900"
          }`}
        >
          <div className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_COLORS[screen.status]}`}
            />
            <span className="truncate text-[9px] text-gray-400">{screen.name}</span>
          </div>
          <p className="truncate text-[8px] text-gray-600">{screen.platform}</p>
          {anomalyCountByScreen.has(screen.id) && (
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-red-600 text-[7px] font-bold text-white flex items-center justify-center">
              !
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Density 500 — tiny dots
function TinyDotGrid({
  screens,
  anomalyCountByScreen,
}: {
  screens: Screen[];
  anomalyCountByScreen: Map<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {screens.map((screen) => (
        <div
          key={screen.id}
          title={`${screen.name} — ${screen.status} — ${screen.platform}`}
          className={`h-4 w-4 rounded-sm ring-1 ${STATUS_COLORS[screen.status]} ${STATUS_RING[screen.status]} ${
            anomalyCountByScreen.has(screen.id) ? "ring-2 ring-red-400" : ""
          }`}
        />
      ))}
    </div>
  );
}
