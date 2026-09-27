export type LibraryStatus = "watchlist" | "watched";

export type UserMovie = {
    id: string;
    user_id: string;
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    status: LibraryStatus;
    created_at: string;
    updated_at: string;
};

export type LibraryItemInput = {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
};
