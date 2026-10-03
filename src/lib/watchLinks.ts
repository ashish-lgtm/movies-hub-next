/**
 * Builds direct platform search/open URLs for TMDB watch providers.
 * TMDB only supplies a JustWatch aggregator link, so popular services
 * are mapped by provider_id to their own search pages.
 */

type ProviderLinkBuilder = (title: string) => string;

/** TMDB provider_id → search URL for that streaming service. */
const PROVIDER_LINKS: Record<number, ProviderLinkBuilder> = {
    // Netflix
    8: (title) =>
        `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    // Amazon Prime Video
    9: (title) =>
        `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
    119: (title) =>
        `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
    // Amazon Video (rent/buy)
    10: (title) =>
        `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
    // Apple TV
    2: (title) =>
        `https://tv.apple.com/search?term=${encodeURIComponent(title)}`,
    // Google Play Movies
    3: (title) =>
        `https://play.google.com/store/search?q=${encodeURIComponent(title)}&c=movies`,
    // YouTube
    192: (title) =>
        `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
    // Disney+
    337: (title) =>
        `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
    // Hotstar / JioHotstar (India)
    122: (title) =>
        `https://www.hotstar.com/in/search?q=${encodeURIComponent(title)}`,
    2202: (title) =>
        `https://www.hotstar.com/in/search?q=${encodeURIComponent(title)}`,
    // Hulu
    15: (title) =>
        `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
    // Max / HBO Max
    1899: (title) =>
        `https://www.max.com/search?q=${encodeURIComponent(title)}`,
    384: (title) =>
        `https://www.max.com/search?q=${encodeURIComponent(title)}`,
    // Paramount+
    531: (title) =>
        `https://www.paramountplus.com/search/?q=${encodeURIComponent(title)}`,
    // Peacock
    386: (title) =>
        `https://www.peacocktv.com/search?q=${encodeURIComponent(title)}`,
    // SonyLIV
    237: (title) =>
        `https://www.sonyliv.com/search?q=${encodeURIComponent(title)}`,
    // Zee5
    232: (title) =>
        `https://www.zee5.com/search?q=${encodeURIComponent(title)}`,
    // JioCinema
    2207: (title) =>
        `https://www.jiocinema.com/search/${encodeURIComponent(title)}`,
    // MUBI
    11: (title) =>
        `https://mubi.com/search/${encodeURIComponent(title)}`,
    // Crunchyroll
    283: (title) =>
        `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
    // Curiosity Stream
    190: (title) =>
        `https://curiositystream.com/search?q=${encodeURIComponent(title)}`,
};

/**
 * Returns a direct link for a provider when known, otherwise the
 * JustWatch fallback from TMDB (if any).
 */
export function getProviderWatchLink(
    providerId: number,
    title: string,
    fallbackLink?: string
): string | undefined {
    const builder = PROVIDER_LINKS[providerId];
    if (builder && title.trim()) {
        return builder(title.trim());
    }

    return fallbackLink;
}
