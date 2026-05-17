export type Platform =
  | "SCOS"
  | "Android"
  | "FireOS"
  | "Tizen"
  | "webOS"
  | "Windows"
  | "ChromeOS"
  | "iOS";

export type ScreenStatus = "OK" | "WARNING" | "CRITICAL" | "OFFLINE";

export type AnomalyType = "OFFLINE" | "PERFORMANCE" | "VISUAL" | "SYNC";

export type AnomalySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ScreenMetadata {
  firmware?: string;
  resolution?: string;
  location?: string;
}

export interface Screen {
  id: string;
  name: string;
  platform: Platform;
  status: ScreenStatus;
  screenshotBase64?: string;
  lastSeen: string; // ISO timestamp
  metadata: ScreenMetadata;
}

export interface ScreenGroup {
  id: string;
  name: string;
  screens: string[]; // screen IDs
}

export interface Anomaly {
  id: string;
  screenId: string;
  screenName: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  detectedAt: string; // ISO timestamp
}

export interface ScreenDiff {
  screenId: string;
  screenName: string;
  statusBefore: ScreenStatus;
  statusAfter: ScreenStatus;
  changed: boolean;
}

export interface ReleaseComparison {
  id: string;
  name: string;
  beforeScreens: string[];
  afterScreens: string[];
  diffs: ScreenDiff[];
  createdAt: string;
}

export interface HeatmapCell {
  screenId: string;
  screenName: string;
  issueCount: number;
  severity: AnomalySeverity;
}
