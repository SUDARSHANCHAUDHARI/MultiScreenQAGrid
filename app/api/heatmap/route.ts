import { NextResponse } from "next/server";
import { screensMap, anomaliesMap } from "@/lib/store";
import type { HeatmapCell, AnomalySeverity } from "@/lib/types";

const SEVERITY_ORDER: Record<AnomalySeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export async function GET() {
  // Build a map of screenId -> { count, maxSeverity }
  const cellMap = new Map<
    string,
    { count: number; maxSeverity: AnomalySeverity }
  >();

  const anomalies = Array.from(anomaliesMap.values());
  for (const anomaly of anomalies) {
    const existing = cellMap.get(anomaly.screenId);
    if (!existing) {
      cellMap.set(anomaly.screenId, {
        count: 1,
        maxSeverity: anomaly.severity,
      });
    } else {
      existing.count += 1;
      const existingSeverity = existing.maxSeverity;
      const newSeverity = anomaly.severity;
      if (SEVERITY_ORDER[newSeverity] > SEVERITY_ORDER[existingSeverity]) {
        existing.maxSeverity = newSeverity;
      }
    }
  }

  const heatmap: HeatmapCell[] = [];

  const allScreens = Array.from(screensMap.values());
  for (const screen of allScreens) {
    const cell = cellMap.get(screen.id);
    heatmap.push({
      screenId: screen.id,
      screenName: screen.name,
      issueCount: cell?.count ?? 0,
      severity: cell?.maxSeverity ?? "LOW",
    });
  }

  // Sort by issueCount descending
  heatmap.sort((a, b) => b.issueCount - a.issueCount);

  return NextResponse.json(heatmap);
}
