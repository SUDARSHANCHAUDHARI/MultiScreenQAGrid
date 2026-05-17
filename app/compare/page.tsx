"use client";

import { useState, useEffect, useCallback } from "react";
import type { Screen, ReleaseComparison, ScreenDiff } from "@/lib/types";

const STATUS_COLORS = {
  OK: "text-green-400",
  WARNING: "text-yellow-400",
  CRITICAL: "text-red-400",
  OFFLINE: "text-gray-500",
} as const;

const STATUS_ARROW: Record<string, string> = {
  "OK→WARNING": "→ ⚠",
  "OK→CRITICAL": "→ ✗",
  "OK→OFFLINE": "→ ○",
  "WARNING→OK": "→ ✓",
  "WARNING→CRITICAL": "→ ✗",
  "CRITICAL→OK": "→ ✓",
  "OFFLINE→OK": "→ ✓",
};

export default function ComparePage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [beforeIds, setBeforeIds] = useState<Set<string>>(new Set());
  const [afterIds, setAfterIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState("Release Comparison");
  const [result, setResult] = useState<ReleaseComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScreens = useCallback(async () => {
    try {
      const res = await fetch("/api/screens");
      if (!res.ok) throw new Error("Failed to fetch screens");
      const data = (await res.json()) as Screen[];
      setScreens(data);
    } catch {
      setError("Failed to load screens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchScreens();
  }, [fetchScreens]);

  const toggleId = (
    id: string,
    set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runComparison = async () => {
    if (beforeIds.size === 0 || afterIds.size === 0) {
      setError("Select at least one screen for both Before and After groups");
      return;
    }
    setComparing(true);
    setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          beforeIds: Array.from(beforeIds),
          afterIds: Array.from(afterIds),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Comparison failed");
      }
      const data = (await res.json()) as ReleaseComparison;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  const firstHalf = screens.slice(0, Math.ceil(screens.length / 2));
  const secondHalf = screens.slice(Math.ceil(screens.length / 2));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Release Comparison</h1>
        <p className="mt-1 text-sm text-gray-400">
          Select screen groups before and after a release to compare status changes.
        </p>
      </div>

      {error && (
        <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Before group */}
        <ScreenSelector
          label="Before (pre-release)"
          screens={firstHalf}
          selectedIds={beforeIds}
          onToggle={(id) => toggleId(id, beforeIds, setBeforeIds)}
          loading={loading}
          accent="border-blue-700"
          accentSelected="bg-blue-900/40 border-blue-600"
        />

        {/* After group */}
        <ScreenSelector
          label="After (post-release)"
          screens={secondHalf}
          selectedIds={afterIds}
          onToggle={(id) => toggleId(id, afterIds, setAfterIds)}
          loading={loading}
          accent="border-purple-700"
          accentSelected="bg-purple-900/40 border-purple-600"
        />
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Comparison name"
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => void runComparison()}
          disabled={comparing || beforeIds.size === 0 || afterIds.size === 0}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {comparing ? "Running AI comparison…" : "Compare Releases"}
        </button>
      </div>

      {result && <ComparisonResult comparison={result} />}
    </div>
  );
}

function ScreenSelector({
  label,
  screens,
  selectedIds,
  onToggle,
  loading,
  accentSelected,
}: {
  label: string;
  screens: Screen[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  loading: boolean;
  accent: string;
  accentSelected: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-300">{label}</h2>
      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : (
        <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
          {screens.map((s) => (
            <button
              key={s.id}
              onClick={() => onToggle(s.id)}
              className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left text-xs transition-colors ${
                selectedIds.has(s.id)
                  ? accentSelected
                  : "border-gray-800 bg-gray-800/50 hover:bg-gray-800"
              }`}
            >
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${
                  s.status === "OK"
                    ? "bg-green-500"
                    : s.status === "WARNING"
                    ? "bg-yellow-500"
                    : s.status === "CRITICAL"
                    ? "bg-red-500"
                    : "bg-gray-600"
                }`}
              />
              <span className="truncate text-gray-300">{s.name}</span>
              <span className="ml-auto flex-shrink-0 text-gray-600">
                {s.platform}
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-600">
        {selectedIds.size} selected
      </p>
    </div>
  );
}

function ComparisonResult({ comparison }: { comparison: ReleaseComparison }) {
  const changed = comparison.diffs.filter((d) => d.changed);
  const unchanged = comparison.diffs.filter((d) => !d.changed);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-1 text-lg font-bold text-white">{comparison.name}</h2>
      <p className="mb-4 text-xs text-gray-500">
        {new Date(comparison.createdAt).toLocaleString()} ·{" "}
        {comparison.diffs.length} screens compared · {changed.length} changed
      </p>

      {changed.length > 0 ? (
        <>
          <h3 className="mb-2 text-sm font-semibold text-gray-300">
            Changed screens ({changed.length})
          </h3>
          <div className="mb-4 space-y-1">
            {changed.map((d) => (
              <DiffRow key={d.screenId} diff={d} />
            ))}
          </div>
        </>
      ) : (
        <p className="mb-4 text-sm text-green-400">
          No status changes detected — release looks stable.
        </p>
      )}

      {unchanged.length > 0 && (
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer hover:text-gray-400">
            {unchanged.length} unchanged screens
          </summary>
          <div className="mt-2 space-y-0.5">
            {unchanged.map((d) => (
              <div key={d.screenId} className="flex items-center gap-2">
                <span className="text-gray-700">{d.screenName}</span>
                <span className={STATUS_COLORS[d.statusBefore]}>
                  {d.statusBefore}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function DiffRow({ diff }: { diff: ScreenDiff }) {
  const key = `${diff.statusBefore}→${diff.statusAfter}`;
  const arrow = STATUS_ARROW[key] ?? "→";
  const degraded =
    diff.statusAfter === "CRITICAL" || diff.statusAfter === "OFFLINE";

  return (
    <div
      className={`flex items-center gap-3 rounded border px-3 py-1.5 text-sm ${
        degraded
          ? "border-red-800 bg-red-950/30"
          : "border-green-800 bg-green-950/30"
      }`}
    >
      <span className="flex-1 truncate text-gray-300">{diff.screenName}</span>
      <span className={STATUS_COLORS[diff.statusBefore]}>
        {diff.statusBefore}
      </span>
      <span className="text-gray-500">{arrow}</span>
      <span className={STATUS_COLORS[diff.statusAfter]}>{diff.statusAfter}</span>
    </div>
  );
}
