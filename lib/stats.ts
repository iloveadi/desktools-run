/**
 * lib/stats.ts
 * ─────────────────────────────────────────────────────────────
 * Tool usage and visitor stats manager for desktools.run.
 * Manages baseline usage metrics, local increments via LocalStorage,
 * and live visitor estimations.
 */

const STORAGE_KEY = "desktools_stats_v1";

// Base realistic usage counts for tools (Modest & Realistic numbers)
const BASE_TOOL_COUNTS: Record<string, number> = {
  "pdf-merger": 145,
  "pdf-split": 82,
  "pdf-compress": 110,
  "pdf-to-word": 64,
  "image-resizer": 135,
  "image-converter": 128,
  "image-compress": 152,
  "background-remover": 94,
  "word-count": 180,
  "text-case": 62,
  "markdown-preview": 58,
  "text-diff": 74,
  "json-formatter": 140,
  "base64": 88,
  "url-encoder": 72,
  "regex-tester": 54,
  "unit-converter": 86,
  "color-converter": 95,
  "csv-to-json": 48,
  "password-generator": 160,
  "hash-generator": 65,
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
  const base = BASE_TOOL_COUNTS[toolId] || 50;
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
  return (BASE_TOOL_COUNTS[toolId] || 50) + stats.toolIncrements[toolId];
}

/** Calculate total usage count across all tools */
export function getTotalSiteUsageCount(): number {
  const stats = getLocalStats();
  const baseTotal = Object.values(BASE_TOOL_COUNTS).reduce((sum, val) => sum + val, 0);
  const extraTotal = Object.values(stats.toolIncrements).reduce((sum, val) => sum + val, 0);
  return baseTotal + extraTotal;
}

/** Format numbers gracefully according to locale (e.g. 1.2k or 1.2천 or 1,280) */
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
