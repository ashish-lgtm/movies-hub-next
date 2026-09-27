import type { SupabaseClient } from "@supabase/supabase-js";
import type { LibraryItemInput, LibraryStatus, UserMovie } from "@/types/library";

/** Fetches the current user's library entry for a specific title. */
export async function getUserMovieStatus(
    supabase: SupabaseClient,
    userId: string,
    tmdbId: number,
    mediaType: string
): Promise<LibraryStatus | null> {
    const { data, error } = await supabase
        .from("user_movies")
        .select("status")
        .eq("user_id", userId)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data?.status as LibraryStatus | undefined) ?? null;
}

/** Upserts a title into the user's library with the given status. */
export async function upsertUserMovie(
    supabase: SupabaseClient,
    userId: string,
    item: LibraryItemInput,
    status: LibraryStatus
): Promise<UserMovie> {
    const { data, error } = await supabase
        .from("user_movies")
        .upsert(
            {
                user_id: userId,
                tmdb_id: item.tmdbId,
                media_type: item.mediaType,
                title: item.title,
                poster_path: item.posterPath,
                status,
            },
            { onConflict: "user_id,tmdb_id,media_type" }
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as UserMovie;
}

/** Removes a title from the user's library. */
export async function removeUserMovie(
    supabase: SupabaseClient,
    userId: string,
    tmdbId: number,
    mediaType: string
): Promise<void> {
    const { error } = await supabase
        .from("user_movies")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType);

    if (error) {
        throw error;
    }
}

/** Lists library items for a user filtered by status. */
export async function listUserMovies(
    supabase: SupabaseClient,
    userId: string,
    status: LibraryStatus
): Promise<UserMovie[]> {
    const { data, error } = await supabase
        .from("user_movies")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status)
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return (data ?? []) as UserMovie[];
}

/** Lists all library items for a user (watchlist and watched). */
export async function listAllUserMovies(
    supabase: SupabaseClient,
    userId: string
): Promise<UserMovie[]> {
    const { data, error } = await supabase
        .from("user_movies")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return (data ?? []) as UserMovie[];
}
