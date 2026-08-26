/**
 * lib/visitorTracker.ts
 * ─────────────────────────────────────────────────────────────
 * Zero-based real visitor tracking system for desktools.run.
 * Starts from 0 with no baseline inflation, accurately counting actual visits.
 */

export interface VisitLog {
  id: string;
  timestamp: number;
  path: string;
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  isNewSession: boolean;
}

export interface VisitorStats {
  totalVisitors: number;
  totalPageViews: number;
  todayVisits: number;
  yesterdayVisits: number;
  lastDateStr: string; // YYYY-MM-DD
  dailyHistory: Record<string, number>; // "YYYY-MM-DD" -> count
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: {
    chrome: number;
    safari: number;
    edge: number;
    firefox: number;
    other: number;
  };
  recentLogs: VisitLog[];
}

const VISITOR_STORAGE_KEY = "desktools_visitor_stats_v3";
const SESSION_ACTIVE_KEY = "desktools_session_visited_v3";

/** Format current date as YYYY-MM-DD in local time */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format yesterday date as YYYY-MM-DD */
function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Detect device type from user agent */
export function detectDevice(): "Desktop" | "Mobile" | "Tablet" {
  if (typeof window === "undefined") return "Desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent)) {
    return "Mobile";
  }
  return "Desktop";
}

/** Detect browser name from user agent */
export function detectBrowser(): string {
  if (typeof window === "undefined") return "Chrome";
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  return "Other";
}

/** Initialize or retrieve visitor stats from localStorage (Strict 0-base) */
export function getVisitorStats(): VisitorStats {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const defaultStats: VisitorStats = {
    totalVisitors: 0,
    totalPageViews: 0,
    todayVisits: 0,
    yesterdayVisits: 0,
    lastDateStr: todayStr,
    dailyHistory: {
      [todayStr]: 0,
      [yesterdayStr]: 0,
    },
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    browserBreakdown: {
      chrome: 0,
      safari: 0,
      edge: 0,
      firefox: 0,
      other: 0,
    },
    recentLogs: [],
  };

  if (typeof window === "undefined") {
    return defaultStats;
  }

  try {
    // Clear old storage keys with dummy baseline values if present
    localStorage.removeItem("desktools_visitor_stats_v2");

    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    }

    const parsed: VisitorStats = JSON.parse(raw);

    // Roll date if day changed
    if (parsed.lastDateStr !== todayStr) {
      parsed.yesterdayVisits = parsed.dailyHistory[yesterdayStr] || parsed.todayVisits || 0;
      parsed.todayVisits = 0;
      parsed.lastDateStr = todayStr;
      parsed.dailyHistory[todayStr] = 0;
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(parsed));
    } else {
      parsed.todayVisits = parsed.dailyHistory[todayStr] || parsed.todayVisits || 0;
      parsed.yesterdayVisits = parsed.dailyHistory[yesterdayStr] || parsed.yesterdayVisits || 0;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to read visitor stats:", e);
    return defaultStats;
  }
}

/** Save visitor stats to localStorage */
export function saveVisitorStats(stats: VisitorStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save visitor stats:", e);
  }
}

/**
 * Record a real visit starting strictly from 0.
 * Deduplicates using sessionStorage so refreshing doesn't artificially count as new visitor,
 * while incrementing pageviews and logging visit details.
 */
export function recordVisit(pathName: string = "/admin/requests"): VisitorStats {
  const stats = getVisitorStats();
  const todayStr = getTodayDateString();
  const device = detectDevice();
  const browser = detectBrowser();

  let isNewSession = false;
  if (typeof window !== "undefined") {
    const sessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    if (!sessionActive) {
      isNewSession = true;
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
    }
  }

  // Increment total page views
  stats.totalPageViews += 1;

  if (isNewSession) {
    // Unique new visitor!
    stats.totalVisitors += 1;
    stats.todayVisits += 1;
    stats.dailyHistory[todayStr] = (stats.dailyHistory[todayStr] || 0) + 1;

    // Device breakdown
    if (device === "Desktop") stats.deviceBreakdown.desktop += 1;
    else if (device === "Mobile") stats.deviceBreakdown.mobile += 1;
    else if (device === "Tablet") stats.deviceBreakdown.tablet += 1;

    // Browser breakdown
    const bKey = browser.toLowerCase() as keyof typeof stats.browserBreakdown;
    if (bKey in stats.browserBreakdown) {
      stats.browserBreakdown[bKey] += 1;
    } else {
      stats.browserBreakdown.other += 1;
    }
  }

  // Add visit log entry
  const newLog: VisitLog = {
    id: `vlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    path: pathName,
    device,
    browser,
    isNewSession,
  };

  stats.recentLogs = [newLog, ...(stats.recentLogs || [])].slice(0, 25);
  saveVisitorStats(stats);

  return stats;
}

/** Reset stats completely to 0 */
export function resetVisitorStats(): VisitorStats {
  if (typeof window !== "undefined") {
    localStorage.removeItem(VISITOR_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  }
  return getVisitorStats();
}
