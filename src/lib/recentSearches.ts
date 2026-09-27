const RECENT_KEY = "movies-hub-recent-searches";
const MAX_RECENT = 6;

/** Loads recent search queries from localStorage. */
export function loadRecentSearches(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = localStorage.getItem(RECENT_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

/** Saves a search query to the front of the recent list. */
export function saveRecentSearch(query: string): void {
    const trimmed = query.trim();

    if (!trimmed) {
        return;
    }

    const next = [
        trimmed,
        ...loadRecentSearches().filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase()
        ),
    ].slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

/** Clears all stored recent search queries. */
export function clearRecentSearches(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(RECENT_KEY);
}
