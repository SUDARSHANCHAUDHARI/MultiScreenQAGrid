import Link from "next/link";
import { screensMap, anomaliesMap } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const screens = Array.from(screensMap.values());
  const anomalies = Array.from(anomaliesMap.values());

  const total = screens.length;
  const critical = screens.filter((s) => s.status === "CRITICAL").length;
  const offline = screens.filter((s) => s.status === "OFFLINE").length;
  const warnings = screens.filter((s) => s.status === "WARNING").length;
  const healthy = screens.filter((s) => s.status === "OK").length;
  const anomalyCount = anomalies.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          MultiScreen QA Grid
        </h1>
        <p className="mt-1 text-gray-400">
          Monitor your entire screen fleet in one place. AI-powered anomaly
          detection for digital signage QA teams.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Screens" value={total} color="blue" />
        <StatCard label="Healthy" value={healthy} color="green" />
        <StatCard label="Warnings" value={warnings} color="yellow" />
        <StatCard label="Critical" value={critical} color="red" />
        <StatCard label="Offline" value={offline} color="gray" />
        <StatCard label="Anomalies" value={anomalyCount} color="orange" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow transition-colors hover:bg-blue-700"
        >
          Open Dashboard →
        </Link>
        <Link
          href="/heatmap"
          className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
        >
          View Heatmap
        </Link>
        <Link
          href="/compare"
          className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
        >
          Release Compare
        </Link>
      </div>

      {/* Feature list */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Features</h2>
        <ul className="grid gap-2 text-sm text-gray-400 sm:grid-cols-2">
          {[
            "Monitor 50 / 100 / 500 screens simultaneously",
            "Density toggle: large cards → tiny dots",
            "Platform filter chips (SCOS, Android, FireOS, etc.)",
            "Real-time status colour coding",
            "AI anomaly detection (Claude or OpenAI)",
            "Issue heatmap by severity",
            "Release comparison: before vs after",
            "Screen grouping by location / platform",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 text-green-400">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "yellow" | "red" | "gray" | "orange";
}) {
  const colorMap: Record<typeof color, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    gray: "text-gray-400",
    orange: "text-orange-400",
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
