export type MediaType = "movie" | "tv" | "all";

export interface Genre {
    id: number;
    name: string;
}

export interface ContentItem {
    id: number;
    poster_path: string | null;
    backdrop_path?: string | null;
    title?: string;
    name?: string;
    first_air_date?: string;
    release_date?: string;
    media_type?: string;
    vote_average: number;
    overview?: string;
    tagline?: string;
    genre_ids?: number[];
    original_language?: string;
}

export interface CastMember {
    id: number;
    name: string;
    profile_path: string | null;
}

export interface VideoResult {
    id?: string;
    key: string;
    name?: string;
    site: string;
    type: string;
    official?: boolean;
    published_at?: string;
}
