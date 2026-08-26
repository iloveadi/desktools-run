/**
 * lib/favorites.ts
 * ─────────────────────────────────────────────────────────────
 * Manages user's favorited / pinned tools stored in LocalStorage.
 */

const FAVORITES_KEY = "desktools_favorite_tools_v1";

/** Default initial favorites for fresh users */
const DEFAULT_FAVORITES = ["pdf-merger", "background-remover", "json-formatter"];

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
