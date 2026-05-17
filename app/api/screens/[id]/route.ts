import { NextRequest, NextResponse } from "next/server";
import { screensMap } from "@/lib/store";
import type { ScreenStatus } from "@/lib/types";

const VALID_STATUSES: ScreenStatus[] = ["OK", "WARNING", "CRITICAL", "OFFLINE"];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const screen = screensMap.get(id);
  if (!screen) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }
  return NextResponse.json(screen);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const screen = screensMap.get(id);
  if (!screen) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }

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

  if (
    typeof raw.status === "string" &&
    VALID_STATUSES.includes(raw.status as ScreenStatus)
  ) {
    screen.status = raw.status as ScreenStatus;
  }

  screen.lastSeen = new Date().toISOString();

  if (typeof raw.screenshotBase64 === "string") {
    screen.screenshotBase64 = raw.screenshotBase64;
  }

  screensMap.set(id, screen);
  return NextResponse.json(screen);
}
