/**
 * lib/favorites.ts
 * ─────────────────────────────────────────────────────────────
 * Manages user's favorited / pinned tools and recently used tools in LocalStorage.
 */

const FAVORITES_KEY = "desktools_favorite_tools_v1";
const RECENTS_KEY = "desktools_recent_tools_v1";

/** Default initial favorites for fresh users */
const DEFAULT_FAVORITES = ["pdf-merger", "image-resizer", "word-count", "json-formatter"];

export function getFavorites(): string[] {
  if (typeof window === "undefined") return DEFAULT_FAVORITES;
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // Initialize defaults on first visit
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(DEFAULT_FAVORITES));
    return DEFAULT_FAVORITES;
  } catch (e) {
    console.error("Failed to read favorites", e);
    return DEFAULT_FAVORITES;
  }
}

export function saveFavorites(favs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    window.dispatchEvent(new Event("desktools-favorites-changed"));
  } catch (e) {
    console.error("Failed to save favorites", e);
  }
}

export function isFavorite(toolId: string): boolean {
  const favs = getFavorites();
  return favs.includes(toolId);
}

export function toggleFavorite(toolId: string): string[] {
  const current = getFavorites();
  let updated: string[];
  if (current.includes(toolId)) {
    updated = current.filter((id) => id !== toolId);
  } else {
    updated = [toolId, ...current];
  }
  saveFavorites(updated);
  return updated;
}

export function getRecentTools(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentTool(toolId: string): void {
  if (typeof window === "undefined" || !toolId) return;
  try {
    const current = getRecentTools().filter((id) => id !== toolId);
    const updated = [toolId, ...current].slice(0, 6);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("desktools-recents-changed"));
  } catch (e) {
    console.error("Failed to record recent tool", e);
  }
}
