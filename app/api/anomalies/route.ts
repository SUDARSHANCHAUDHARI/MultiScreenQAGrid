import { NextResponse } from "next/server";
import { screensMap, anomaliesMap } from "@/lib/store";
import { analyzeScreensWithAI } from "@/lib/ai";
import type { Anomaly, AnomalyType, AnomalySeverity } from "@/lib/types";

const VALID_TYPES: AnomalyType[] = ["OFFLINE", "PERFORMANCE", "VISUAL", "SYNC"];
const VALID_SEVERITIES: AnomalySeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function GET() {
  const anomalies = Array.from(anomaliesMap.values());
  return NextResponse.json(anomalies);
}

export async function POST() {
  const screens = Array.from(screensMap.values());
  if (screens.length === 0) {
    return NextResponse.json([]);
  }

  // Strip screenshotBase64 to keep prompt small — AI only needs metadata + status
  const screensForAI = screens.map((s) => ({
    id: s.id,
    name: s.name,
    platform: s.platform,
    status: s.status,
    lastSeen: s.lastSeen,
    metadata: s.metadata,
  }));

  let aiResponse: string;
  try {
    aiResponse = await analyzeScreensWithAI(JSON.stringify(screensForAI, null, 2));
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Parse AI response — it may wrap in {"anomalies": [...]} or be a raw array
  let parsed: unknown;
  try {
    parsed = JSON.parse(aiResponse);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
  }

  const rawArray: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown>).anomalies)
    ? ((parsed as Record<string, unknown>).anomalies as unknown[])
    : [];

  const newAnomalies: Anomaly[] = [];
  for (const item of rawArray) {
    if (typeof item !== "object" || item === null) continue;
    const raw = item as Record<string, unknown>;

    const screenId = typeof raw.screenId === "string" ? raw.screenId : null;
    const screenName = typeof raw.screenName === "string" ? raw.screenName : "Unknown";
    const type = VALID_TYPES.includes(raw.type as AnomalyType)
      ? (raw.type as AnomalyType)
      : null;
    const severity = VALID_SEVERITIES.includes(raw.severity as AnomalySeverity)
      ? (raw.severity as AnomalySeverity)
      : "LOW" as AnomalySeverity;
    const description =
      typeof raw.description === "string" ? raw.description : "Anomaly detected";

    if (!screenId || !type) continue;

    const anomaly: Anomaly = {
      id: crypto.randomUUID(),
      screenId,
      screenName,
      type,
      severity,
      description,
      detectedAt: new Date().toISOString(),
    };
    anomaliesMap.set(anomaly.id, anomaly);
    newAnomalies.push(anomaly);
  }

  return NextResponse.json(newAnomalies, { status: 201 });
}
