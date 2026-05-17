import type { HeatmapCell, AnomalySeverity } from "@/lib/types";

export const dynamic = "force-dynamic";

const SEVERITY_BG: Record<AnomalySeverity, string> = {
  LOW: "bg-yellow-900/50 border-yellow-800",
  MEDIUM: "bg-orange-900/50 border-orange-800",
  HIGH: "bg-red-900/60 border-red-700",
  CRITICAL: "bg-red-950 border-red-500",
};

const SEVERITY_TEXT: Record<AnomalySeverity, string> = {
  LOW: "text-yellow-400",
  MEDIUM: "text-orange-400",
  HIGH: "text-red-400",
  CRITICAL: "text-red-300 font-bold",
};

async function getHeatmap(): Promise<HeatmapCell[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/heatmap`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json() as Promise<HeatmapCell[]>;
}

export default async function HeatmapPage() {
  const cells = await getHeatmap();

  const withIssues = cells.filter((c) => c.issueCount > 0);
  const clean = cells.filter((c) => c.issueCount === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Issue Heatmap</h1>
        <p className="mt-1 text-sm text-gray-400">
          Screens colour-coded by issue severity. {withIssues.length} screens
          with issues, {clean.length} clean.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as AnomalySeverity[]).map(
          (s) => (
            <span
              key={s}
              className={`rounded border px-2 py-1 text-xs ${SEVERITY_BG[s]} ${SEVERITY_TEXT[s]}`}
            >
              {s}
            </span>
          )
        )}
        <span className="rounded border border-gray-800 bg-gray-900 px-2 py-1 text-xs text-gray-500">
          CLEAN
        </span>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {cells.map((cell) => (
          <HeatmapTile key={cell.screenId} cell={cell} />
        ))}
      </div>
    </div>
  );
}

function HeatmapTile({ cell }: { cell: HeatmapCell }) {
  const hasIssues = cell.issueCount > 0;

  return (
    <div
      className={`rounded border p-2 text-center ${
        hasIssues
          ? `${SEVERITY_BG[cell.severity]}`
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <p className="truncate text-xs font-medium text-gray-300">{cell.screenName}</p>
      {hasIssues ? (
        <>
          <p className={`text-lg font-bold ${SEVERITY_TEXT[cell.severity]}`}>
            {cell.issueCount}
          </p>
          <p className={`text-[10px] ${SEVERITY_TEXT[cell.severity]}`}>
            {cell.severity}
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-700">—</p>
      )}
    </div>
  );
}
