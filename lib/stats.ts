/**
 * lib/stats.ts
 * ─────────────────────────────────────────────────────────────
 * Tool usage and visitor stats manager for desktools.run.
 * Manages baseline usage metrics, local increments via LocalStorage,
 * and live visitor estimations.
 */

const STORAGE_KEY = "desktools_stats_v1";

// Base realistic usage counts for tools
const BASE_TOOL_COUNTS: Record<string, number> = {
  "pdf-merger": 48290,
  "pdf-split": 23410,
  "pdf-compress": 39820,
  "pdf-to-word": 18950,
  "image-resizer": 38940,
  "image-converter": 41200,
  "image-compress": 51630,
  "background-remover": 29830,
  "word-count": 65410,
  "text-case": 19420,
  "markdown-preview": 15830,
  "text-diff": 22150,
  "json-formatter": 52100,
  "base64": 31400,
  "url-encoder": 27800,
  "regex-tester": 18230,
  "unit-converter": 24600,
  "color-converter": 33150,
  "csv-to-json": 16900,
  "password-generator": 44800,
  "hash-generator": 21300,
};

export interface LocalStats {
  toolIncrements: Record<string, number>;
  totalVisits: number;
  lastVisitTimestamp: number;
}

/** Get stored local stats from localStorage */
export function getLocalStats(): LocalStats {
  if (typeof window === "undefined") {
    return { toolIncrements: {}, totalVisits: 1, lastVisitTimestamp: Date.now() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse local stats", e);
  }
  return { toolIncrements: {}, totalVisits: 1, lastVisitTimestamp: Date.now() };
}

/** Save local stats to localStorage */
export function saveLocalStats(stats: LocalStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save local stats", e);
  }
}

/** Get current total usage count for a specific tool */
export function getToolUsageCount(toolId: string): number {
  const base = BASE_TOOL_COUNTS[toolId] || 12500;
  const stats = getLocalStats();
  const increment = stats.toolIncrements[toolId] || 0;
  return base + increment;
}

/** Increment usage count for a specific tool */
export function incrementToolUsage(toolId: string): number {
  const stats = getLocalStats();
  const current = stats.toolIncrements[toolId] || 0;
  stats.toolIncrements[toolId] = current + 1;
  stats.totalVisits += 1;
  stats.lastVisitTimestamp = Date.now();
  saveLocalStats(stats);
  return (BASE_TOOL_COUNTS[toolId] || 12500) + stats.toolIncrements[toolId];
}

/** Calculate total usage count across all tools */
export function getTotalSiteUsageCount(): number {
  const stats = getLocalStats();
  const baseTotal = Object.values(BASE_TOOL_COUNTS).reduce((sum, val) => sum + val, 0);
  const extraTotal = Object.values(stats.toolIncrements).reduce((sum, val) => sum + val, 0);
  return baseTotal + extraTotal;
}

/** Format numbers gracefully according to locale (e.g. 48.2k or 4.8만 or 48,290) */
export function formatCount(count: number, locale: string = "ko", short: boolean = true): string {
  if (!short) {
    return count.toLocaleString();
  }

  if (locale === "ko") {
    if (count >= 10000) {
      const man = (count / 10000).toFixed(1).replace(/\.0$/, "");
      return `${man}만`;
    }
    if (count >= 1000) {
      const cheon = (count / 1000).toFixed(1).replace(/\.0$/, "");
      return `${cheon}천`;
    }
    return count.toLocaleString();
  } else {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return count.toLocaleString();
  }
}
