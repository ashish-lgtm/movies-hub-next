export type SearchMode = "title" | "actor" | "director";

export type SearchScope = "movie" | "tv" | "anime" | "upcoming";

export const SEARCH_MODE_OPTIONS: { id: SearchMode; label: string }[] = [
    { id: "title", label: "Title" },
    { id: "actor", label: "Actor" },
    { id: "director", label: "Director" },
];

/** Returns the display label for a search mode. */
export function searchModeLabel(mode: SearchMode): string {
    return (
        SEARCH_MODE_OPTIONS.find((option) => option.id === mode)?.label ??
        "Title"
    );
}

/** Placeholder text for the active search mode and page scope. */
export function searchPlaceholder(
    mode: SearchMode,
    scope?: SearchScope | "all"
): string {
    if (mode === "actor") {
        return "Search by actor…";
    }

    if (mode === "director") {
        return "Search by director…";
    }

    switch (scope) {
        case "movie":
            return "Search movies…";
        case "tv":
            return "Search series…";
        case "anime":
            return "Search anime…";
        case "upcoming":
            return "Search upcoming titles…";
        default:
            return "Search titles…";
    }
}
