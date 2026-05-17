import { NextRequest, NextResponse } from "next/server";
import { screensMap } from "@/lib/store";
import type { Screen, Platform, ScreenStatus, ScreenMetadata } from "@/lib/types";

const VALID_PLATFORMS: Platform[] = [
  "SCOS",
  "Android",
  "FireOS",
  "Tizen",
  "webOS",
  "Windows",
  "ChromeOS",
  "iOS",
];

const VALID_STATUSES: ScreenStatus[] = ["OK", "WARNING", "CRITICAL", "OFFLINE"];

export async function GET() {
  const screens = Array.from(screensMap.values());
  return NextResponse.json(screens);
}

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

  const id = typeof raw.id === "string" ? raw.id : crypto.randomUUID();
  const name = typeof raw.name === "string" ? raw.name : `Screen-${id.slice(0, 8)}`;
  const platform: Platform = VALID_PLATFORMS.includes(raw.platform as Platform)
    ? (raw.platform as Platform)
    : "Android";
  const status: ScreenStatus = VALID_STATUSES.includes(raw.status as ScreenStatus)
    ? (raw.status as ScreenStatus)
    : "OK";

  const rawMeta =
    typeof raw.metadata === "object" && raw.metadata !== null
      ? (raw.metadata as Record<string, unknown>)
      : {};

  const metadata: ScreenMetadata = {};
  if (typeof rawMeta.firmware === "string") metadata.firmware = rawMeta.firmware;
  if (typeof rawMeta.resolution === "string") metadata.resolution = rawMeta.resolution;
  if (typeof rawMeta.location === "string") metadata.location = rawMeta.location;

  const screen: Screen = {
    id,
    name,
    platform,
    status,
    lastSeen: new Date().toISOString(),
    metadata,
  };

  if (typeof raw.screenshotBase64 === "string") {
    screen.screenshotBase64 = raw.screenshotBase64;
  }

  screensMap.set(id, screen);
  return NextResponse.json(screen, { status: 201 });
}
