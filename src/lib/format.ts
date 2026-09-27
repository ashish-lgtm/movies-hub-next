import type { ContentItem } from "@/types/tmdb";

/** Returns the display title for a movie or TV item. */
export function getContentTitle(item: ContentItem): string {
    return item.title || item.name || "";
}

/** Returns the release or air year from a content item. */
export function getContentYear(item: ContentItem, fallback = "-----"): string {
    const date = item.first_air_date || item.release_date || fallback;
    return date.substring(0, 4);
}

/** Returns the year portion of an optional date string. */
export function getYearFromDate(date?: string, fallback = "—"): string {
    return date?.slice(0, 4) || fallback;
}

/** Today's local date as YYYY-MM-DD. */
function todayLocalISO(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** True when the release/air date is missing or still in the future. */
export function isUnreleasedDate(date?: string): boolean {
    if (!date) {
        return true;
    }

    return date > todayLocalISO();
}

/** Returns a human-readable media type label. */
export function getMediaLabel(mediaType: string): string {
    return mediaType === "tv" ? "Series" : "Movie";
}
