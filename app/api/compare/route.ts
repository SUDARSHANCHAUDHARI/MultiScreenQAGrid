import { NextRequest, NextResponse } from "next/server";
import { screensMap, comparisonsMap } from "@/lib/store";
import { compareReleasesWithAI } from "@/lib/ai";
import type { ReleaseComparison, ScreenDiff, ScreenStatus } from "@/lib/types";

const VALID_STATUSES: ScreenStatus[] = ["OK", "WARNING", "CRITICAL", "OFFLINE"];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name : "Unnamed Comparison";
  const beforeIds = Array.isArray(raw.beforeIds)
    ? (raw.beforeIds as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const afterIds = Array.isArray(raw.afterIds)
    ? (raw.afterIds as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  if (beforeIds.length === 0 || afterIds.length === 0) {
    return NextResponse.json(
      { error: "beforeIds and afterIds must be non-empty arrays of screen IDs" },
      { status: 400 }
    );
  }

  const beforeScreens = beforeIds
    .map((id) => screensMap.get(id))
    .filter((s) => s !== undefined);
  const afterScreens = afterIds
    .map((id) => screensMap.get(id))
    .filter((s) => s !== undefined);

  let aiResponse: string;
  try {
    aiResponse = await compareReleasesWithAI(
      JSON.stringify(beforeScreens, null, 2),
      JSON.stringify(afterScreens, null, 2)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(aiResponse);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
  }

  const rawArray: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown>).diffs)
    ? ((parsed as Record<string, unknown>).diffs as unknown[])
    : [];

  const diffs: ScreenDiff[] = [];
  for (const item of rawArray) {
    if (typeof item !== "object" || item === null) continue;
    const d = item as Record<string, unknown>;
    const screenId = typeof d.screenId === "string" ? d.screenId : null;
    const screenName = typeof d.screenName === "string" ? d.screenName : "Unknown";
    const statusBefore = VALID_STATUSES.includes(d.statusBefore as ScreenStatus)
      ? (d.statusBefore as ScreenStatus)
      : null;
    const statusAfter = VALID_STATUSES.includes(d.statusAfter as ScreenStatus)
      ? (d.statusAfter as ScreenStatus)
      : null;

    if (!screenId || !statusBefore || !statusAfter) continue;

    diffs.push({
      screenId,
      screenName,
      statusBefore,
      statusAfter,
      changed: statusBefore !== statusAfter,
    });
  }

  const comparison: ReleaseComparison = {
    id: crypto.randomUUID(),
    name,
    beforeScreens: beforeIds,
    afterScreens: afterIds,
    diffs,
    createdAt: new Date().toISOString(),
  };

  comparisonsMap.set(comparison.id, comparison);
  return NextResponse.json(comparison, { status: 201 });
}
