import axios from "axios";
import { API_KEY, TMDB_BASE } from "@/config/config";
import type { CastMember, ContentItem, Genre, VideoResult } from "@/types/tmdb";

export type PagedResult = {
    results: ContentItem[];
    total_pages: number;
};

/** Fetches daily trending movies and TV shows for a page. */
export async function fetchTrending(page: number): Promise<ContentItem[]> {
    const { data } = await axios.get<{ results: ContentItem[] }>(
        `${TMDB_BASE}/trending/all/day?api_key=${API_KEY}&page=${page}`
    );

    return data.results;
}

/** Fetches discover movies filtered by optional genre ids. */
export async function fetchMovies(
    page: number,
    genreIds: string
): Promise<PagedResult> {
    const { data } = await axios.get<PagedResult>(
        `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreIds}`
    );

    return data;
}

/** Fetches discover TV series filtered by optional genre ids. */
export async function fetchSeries(
    page: number,
    genreIds: string
): Promise<PagedResult> {
    const { data } = await axios.get<PagedResult>(
        `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreIds}`
    );

    return data;
}

/** Fetches popular Japanese animation (anime) TV shows. */
export async function fetchAnime(page: number): Promise<PagedResult> {
    // Genre 16 = Animation; ja = Japanese — TMDB's usual anime filter
    const { data } = await axios.get<PagedResult>(
        `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${page}&with_genres=16&with_original_language=ja`
    );

    return data;
}

/** Returns a local calendar date as YYYY-MM-DD, optionally offset by days. */
function localISODate(offsetDays = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/** True when the title's release/air date is strictly after today. */
function isUnreleased(item: ContentItem, today: string): boolean {
    const releaseDate = item.release_date || item.first_air_date;
    return Boolean(releaseDate && releaseDate > today);
}

/** Fetches upcoming movies, series, and anime that release after today. */
export async function fetchUpcoming(page: number): Promise<PagedResult> {
    const today = localISODate();
    const tomorrow = localISODate(1);

    const [movies, series, anime] = await Promise.all([
        axios.get<PagedResult>(
            `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=primary_release_date.asc&include_adult=false&include_video=false&page=${page}&primary_release_date.gte=${tomorrow}`
        ),
        axios.get<PagedResult>(
            `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=first_air_date.asc&include_adult=false&page=${page}&first_air_date.gte=${tomorrow}`
        ),
        axios.get<PagedResult>(
            `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=first_air_date.asc&include_adult=false&page=${page}&first_air_date.gte=${tomorrow}&with_genres=16&with_original_language=ja`
        ),
    ]);

    const tagged: ContentItem[] = [
        ...movies.data.results.map((item) => ({
            ...item,
            media_type: "movie",
        })),
        ...series.data.results.map((item) => ({
            ...item,
            media_type: "tv",
        })),
        ...anime.data.results.map((item) => ({
            ...item,
            media_type: "tv",
        })),
    ];

    const byKey = new Map<string, ContentItem>();

    for (const item of tagged) {
        if (!isUnreleased(item, today)) {
            continue;
        }

        const key = `${item.media_type}-${item.id}`;

        if (!byKey.has(key)) {
            byKey.set(key, item);
        }
    }

    const results = Array.from(byKey.values()).sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || "9999-12-31";
        const dateB = b.release_date || b.first_air_date || "9999-12-31";
        return dateA.localeCompare(dateB);
    });

    return {
        results,
        total_pages: Math.max(
            movies.data.total_pages,
            series.data.total_pages,
            anime.data.total_pages,
            1
        ),
    };
}

/** Searches movies or TV series by query text. */
export async function searchContent(
    query: string,
    type: "movie" | "tv",
    page: number
): Promise<PagedResult> {
    const { data } = await axios.get<{
        results: ContentItem[];
        total_pages: number;
        total_results: number;
    }>(
        `${TMDB_BASE}/search/${type}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );

    const totalPagesFromResults =
        data.total_results > 0 ? Math.ceil(data.total_results / 20) : 0;

    return {
        results: data.results,
        total_pages: Math.min(data.total_pages || 0, totalPagesFromResults || 0, 500),
    };
}

const SEARCH_PAGE_SIZE = 20;
const MAX_SEARCH_SOURCE_PAGES = 8;

/** True when a TV result looks like Japanese animation (anime). */
function isAnimeItem(item: ContentItem): boolean {
    return (
        item.original_language === "ja" &&
        Boolean(item.genre_ids?.includes(16))
    );
}

/** Paginates an in-memory list into TMDB-sized pages. */
function paginateItems(items: ContentItem[], page: number): PagedResult {
    if (items.length === 0) {
        return { results: [], total_pages: 0 };
    }

    const total_pages = Math.ceil(items.length / SEARCH_PAGE_SIZE);
    const safePage = Math.min(Math.max(page, 1), total_pages);
    const start = (safePage - 1) * SEARCH_PAGE_SIZE;

    return {
        results: items.slice(start, start + SEARCH_PAGE_SIZE),
        total_pages,
    };
}

/** Loads several TMDB search pages for client-side filtering. */
async function collectSearchPages(
    query: string,
    type: "movie" | "tv"
): Promise<ContentItem[]> {
    const first = await searchContent(query, type, 1);
    const sourcePages = Math.min(first.total_pages, MAX_SEARCH_SOURCE_PAGES);

    if (sourcePages <= 1) {
        return first.results;
    }

    const rest = await Promise.all(
        Array.from({ length: sourcePages - 1 }, (_, index) =>
            searchContent(query, type, index + 2)
        )
    );

    return [first, ...rest].flatMap((data) => data.results);
}

/** Searches anime by filtering Japanese animation from TV search results. */
export async function searchAnime(
    query: string,
    page: number
): Promise<PagedResult> {
    const collected = await collectSearchPages(query, "tv");
    return paginateItems(collected.filter(isAnimeItem), page);
}

/** Searches upcoming titles — only results releasing after today. */
export async function searchUpcoming(
    query: string,
    page: number
): Promise<PagedResult> {
    const today = localISODate();

    const [movies, series] = await Promise.all([
        collectSearchPages(query, "movie"),
        collectSearchPages(query, "tv"),
    ]);

    const tagged: ContentItem[] = [
        ...movies.map((item) => ({
            ...item,
            media_type: "movie",
        })),
        ...series.map((item) => ({
            ...item,
            media_type: "tv",
        })),
    ];

    const byKey = new Map<string, ContentItem>();

    for (const item of tagged) {
        if (!isUnreleased(item, today)) {
            continue;
        }

        const key = `${item.media_type}-${item.id}`;

        if (!byKey.has(key)) {
            byKey.set(key, item);
        }
    }

    const results = Array.from(byKey.values()).sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || "9999-12-31";
        const dateB = b.release_date || b.first_air_date || "9999-12-31";
        return dateA.localeCompare(dateB);
    });

    return paginateItems(results, page);
}

type PersonCredit = ContentItem & {
    job?: string;
    popularity?: number;
};

/** Finds the best-matching TMDB person id for a name query. */
async function findPersonId(query: string): Promise<number | undefined> {
    const { data } = await axios.get<{
        results: { id: number; popularity: number }[];
    }>(
        `${TMDB_BASE}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&include_adult=false`
    );

    const ranked = [...data.results].sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
    );

    return ranked[0]?.id;
}

/** Dedupes credits and sorts by popularity. */
function normalizeCredits(items: PersonCredit[]): ContentItem[] {
    const byKey = new Map<string, ContentItem>();

    for (const item of items) {
        const mediaType = item.media_type || (item.title ? "movie" : "tv");
        const key = `${mediaType}-${item.id}`;

        if (!byKey.has(key)) {
            byKey.set(key, { ...item, media_type: mediaType });
        }
    }

    return Array.from(byKey.values()).sort(
        (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
    );
}

/** Loads cast or director credits for a person across movies and/or TV. */
async function fetchPersonCredits(
    personId: number,
    role: "actor" | "director",
    includeMovies: boolean,
    includeTv: boolean
): Promise<ContentItem[]> {
    const requests: Promise<ContentItem[]>[] = [];

    if (includeMovies) {
        requests.push(
            axios
                .get<{ cast: PersonCredit[]; crew: PersonCredit[] }>(
                    `${TMDB_BASE}/person/${personId}/movie_credits?api_key=${API_KEY}&language=en-US`
                )
                .then(({ data }) => {
                    const source =
                        role === "actor"
                            ? data.cast
                            : data.crew.filter((item) => item.job === "Director");

                    return source.map((item) => ({
                        ...item,
                        media_type: "movie",
                    }));
                })
        );
    }

    if (includeTv) {
        requests.push(
            axios
                .get<{ cast: PersonCredit[]; crew: PersonCredit[] }>(
                    `${TMDB_BASE}/person/${personId}/tv_credits?api_key=${API_KEY}&language=en-US`
                )
                .then(({ data }) => {
                    const source =
                        role === "actor"
                            ? data.cast
                            : data.crew.filter((item) => item.job === "Director");

                    return source.map((item) => ({
                        ...item,
                        media_type: "tv",
                    }));
                })
        );
    }

    const batches = await Promise.all(requests);
    return normalizeCredits(batches.flat());
}

export type PersonSearchScope = "movie" | "tv" | "anime" | "upcoming" | "all";

/** Searches titles by actor or director name within a content scope. */
export async function searchByPerson(
    query: string,
    role: "actor" | "director",
    scope: PersonSearchScope,
    page: number
): Promise<PagedResult> {
    const personId = await findPersonId(query);

    if (!personId) {
        return { results: [], total_pages: 0 };
    }

    const includeMovies = scope === "movie" || scope === "upcoming" || scope === "all";
    const includeTv =
        scope === "tv" ||
        scope === "anime" ||
        scope === "upcoming" ||
        scope === "all";

    let credits = await fetchPersonCredits(
        personId,
        role,
        includeMovies,
        includeTv
    );

    if (scope === "anime") {
        credits = credits.filter(isAnimeItem);
    }

    if (scope === "upcoming") {
        const today = localISODate();
        credits = credits
            .filter((item) => isUnreleased(item, today))
            .sort((a, b) => {
                const dateA = a.release_date || a.first_air_date || "9999-12-31";
                const dateB = b.release_date || b.first_air_date || "9999-12-31";
                return dateA.localeCompare(dateB);
            });
    }

    if (scope === "movie") {
        credits = credits.filter((item) => item.media_type === "movie");
    }

    if (scope === "tv" || scope === "anime") {
        credits = credits.filter((item) => item.media_type === "tv");
    }

    return paginateItems(credits, page);
}

/** Runs a title, actor, or director search within a browse scope. */
export async function searchInScope(
    query: string,
    mode: "title" | "actor" | "director",
    scope: PersonSearchScope,
    page: number
): Promise<PagedResult> {
    if (mode === "actor" || mode === "director") {
        return searchByPerson(query, mode, scope, page);
    }

    switch (scope) {
        case "tv":
            return searchContent(query, "tv", page);
        case "anime":
            return searchAnime(query, page);
        case "upcoming":
            return searchUpcoming(query, page);
        case "all": {
            const [movies, series] = await Promise.all([
                searchContent(query, "movie", page),
                searchContent(query, "tv", page),
            ]);
            const merged = normalizeCredits([
                ...movies.results.map((item) => ({
                    ...item,
                    media_type: "movie",
                })),
                ...series.results.map((item) => ({
                    ...item,
                    media_type: "tv",
                })),
            ]);
            return {
                results: merged.slice(0, SEARCH_PAGE_SIZE),
                total_pages: Math.max(movies.total_pages, series.total_pages, 0),
            };
        }
        case "movie":
        default:
            return searchContent(query, "movie", page);
    }
}

/** Fetches the genre list for movies or TV. */
export async function fetchGenres(type: "movie" | "tv"): Promise<Genre[]> {
    const { data } = await axios.get<{ genres: Genre[] }>(
        `${TMDB_BASE}/genre/${type}/list?api_key=${API_KEY}&language=en-US`
    );

    return data.genres;
}

/** Fetches full details for a single movie or TV item. */
export async function fetchContentDetails(
    mediaType: string,
    id: number
): Promise<ContentItem> {
    const { data } = await axios.get<ContentItem>(
        `${TMDB_BASE}/${mediaType}/${id}?api_key=${API_KEY}&language=en-US`
    );

    return data;
}

/** Picks the best YouTube trailer key from TMDB video results. */
function pickYouTubeTrailerKey(results: VideoResult[]): string | undefined {
    const youtube = results.filter(
        (video) => video.site === "YouTube" && Boolean(video.key)
    );

    const byType = (type: string) =>
        youtube.filter((video) => video.type === type);

    const officialTrailer = byType("Trailer").find((video) => video.official);
    const anyTrailer = byType("Trailer")[0];
    const teaser = byType("Teaser")[0];
    const clip = byType("Clip")[0];

    return (
        officialTrailer?.key ??
        anyTrailer?.key ??
        teaser?.key ??
        clip?.key ??
        youtube[0]?.key
    );
}

/** Fetches the best YouTube trailer key for a content item. */
export async function fetchTrailerKey(
    mediaType: string,
    id: number
): Promise<string | undefined> {
    const { data } = await axios.get<{ results: VideoResult[] }>(
        `${TMDB_BASE}/${mediaType}/${id}/videos?api_key=${API_KEY}&language=en-US&include_video_language=en-US,null`
    );

    const preferred = pickYouTubeTrailerKey(data.results);
    if (preferred) {
        return preferred;
    }

    // Some titles only expose trailers when language is unrestricted.
    const fallback = await axios.get<{ results: VideoResult[] }>(
        `${TMDB_BASE}/${mediaType}/${id}/videos?api_key=${API_KEY}`
    );

    return pickYouTubeTrailerKey(fallback.data.results);
}

/** Fetches cast credits for a movie or TV item. */
export async function fetchCredits(
    mediaType: string,
    id: number
): Promise<CastMember[]> {
    const { data } = await axios.get<{ cast: CastMember[] }>(
        `${TMDB_BASE}/${mediaType}/${id}/credits?api_key=${API_KEY}&language=en-US`
    );

    return data.cast;
}

const MAX_RECOMMENDATION_SEEDS = 12;

export type RecommendationSeed = {
    tmdb_id: number;
    media_type: string;
};

/** Fetches TMDB recommendations for a single title. */
async function fetchTitleRecommendations(
    mediaType: string,
    id: number
): Promise<ContentItem[]> {
    try {
        const { data } = await axios.get<{ results: ContentItem[] }>(
            `${TMDB_BASE}/${mediaType}/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
        );

        return data.results.map((item) => ({
            ...item,
            media_type: mediaType,
        }));
    } catch {
        return [];
    }
}

/**
 * Builds personalized recommendations from watchlist/watched seeds.
 * Scores titles by how often they appear across seeds plus rating.
 */
export async function fetchLibraryRecommendations(
    seeds: RecommendationSeed[],
    page: number
): Promise<PagedResult> {
    if (seeds.length === 0) {
        return { results: [], total_pages: 0 };
    }

    const exclude = new Set(
        seeds.map((seed) => `${seed.media_type}-${seed.tmdb_id}`)
    );
    const limited = seeds.slice(0, MAX_RECOMMENDATION_SEEDS);

    const batches = await Promise.all(
        limited.map((seed) =>
            fetchTitleRecommendations(seed.media_type, seed.tmdb_id)
        )
    );

    const ranked = new Map<
        string,
        { item: ContentItem; score: number }
    >();

    for (const batch of batches) {
        for (const item of batch) {
            const mediaType = item.media_type || "movie";
            const key = `${mediaType}-${item.id}`;

            if (exclude.has(key)) {
                continue;
            }

            const bump = 1 + Number(item.vote_average || 0) / 10;
            const existing = ranked.get(key);

            if (existing) {
                existing.score += bump;
            } else {
                ranked.set(key, {
                    item: { ...item, media_type: mediaType },
                    score: bump,
                });
            }
        }
    }

    const results = Array.from(ranked.values())
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);

    return paginateItems(results, page);
}
