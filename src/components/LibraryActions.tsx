"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    getUserMovieStatus,
    removeUserMovie,
    upsertUserMovie,
} from "@/lib/library";
import type { LibraryStatus } from "@/types/library";

type LibraryActionsProps = {
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
};

const SCHEMA_SQL_URL =
    "https://supabase.com/dashboard/project/anxlwopvhjacjnxudyhv/sql/new";

/** Builds a user-facing message from a library/API error. */
function getLibraryErrorMessage(error: unknown): string {
    const message =
        error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);

    if (message.includes("user_movies") || message.includes("PGRST205")) {
        return "Database table missing. Run supabase/schema.sql in the Supabase SQL Editor, then try again.";
    }

    return message || "Something went wrong updating your library.";
}

/** Watchlist and watched action buttons for a movie or series. */
export default function LibraryActions({
    tmdbId,
    mediaType,
    title,
    posterPath,
}: LibraryActionsProps) {
    const [status, setStatus] = useState<LibraryStatus | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const normalizedType = mediaType === "tv" ? "tv" : "movie";

    useEffect(() => {
        let cancelled = false;

        /** Loads auth state and current library status for this title. */
        async function loadStatus() {
            setLoading(true);
            setError(null);
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();

            if (cancelled) {
                return;
            }

            if (!data.user) {
                setUserId(null);
                setStatus(null);
                setLoading(false);
                return;
            }

            setUserId(data.user.id);

            try {
                const current = await getUserMovieStatus(
                    supabase,
                    data.user.id,
                    tmdbId,
                    normalizedType
                );

                if (!cancelled) {
                    setStatus(current);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError(getLibraryErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadStatus();

        return () => {
            cancelled = true;
        };
    }, [tmdbId, normalizedType]);

    /** Adds or removes the title from the watchlist. */
    async function toggleWatchlist() {
        if (!userId || busy) {
            return;
        }

        setBusy(true);
        setError(null);
        const supabase = createClient();

        try {
            if (status === "watchlist") {
                await removeUserMovie(supabase, userId, tmdbId, normalizedType);
                setStatus(null);
            } else {
                await upsertUserMovie(
                    supabase,
                    userId,
                    {
                        tmdbId,
                        mediaType: normalizedType,
                        title,
                        posterPath,
                    },
                    "watchlist"
                );
                setStatus("watchlist");
            }
        } catch (err) {
            console.error(err);
            setError(getLibraryErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    /** Marks the title as watched or removes that status. */
    async function toggleWatched() {
        if (!userId || busy) {
            return;
        }

        setBusy(true);
        setError(null);
        const supabase = createClient();

        try {
            if (status === "watched") {
                await removeUserMovie(supabase, userId, tmdbId, normalizedType);
                setStatus(null);
            } else {
                await upsertUserMovie(
                    supabase,
                    userId,
                    {
                        tmdbId,
                        mediaType: normalizedType,
                        title,
                        posterPath,
                    },
                    "watched"
                );
                setStatus("watched");
            }
        } catch (err) {
            console.error(err);
            setError(getLibraryErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking library…</span>
            </div>
        );
    }

    if (!userId) {
        return (
            <p className="text-sm text-muted">
                <Link href="/login" className="text-accent-soft hover:underline">
                    Sign in
                </Link>{" "}
                to save this title to your library.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={toggleWatchlist}
                    className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                        status === "watchlist"
                            ? "border-accent bg-accent/15 text-accent-soft hover:bg-accent/25"
                            : "border-border text-muted hover:border-accent hover:text-accent"
                    }`}
                >
                    {status === "watchlist" ? (
                        <BookmarkCheck className="h-4 w-4" />
                    ) : (
                        <Bookmark className="h-4 w-4" />
                    )}
                    {status === "watchlist" ? "In watchlist" : "Add to watchlist"}
                </button>

                <button
                    type="button"
                    disabled={busy}
                    onClick={toggleWatched}
                    className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                        status === "watched"
                            ? "border-accent bg-accent text-background hover:bg-accent-soft"
                            : "border-border text-muted hover:border-accent hover:text-accent"
                    }`}
                >
                    <Check className="h-4 w-4" />
                    {status === "watched" ? "Watched" : "Mark as watched"}
                </button>
            </div>

            {error && (
                <div className="space-y-1 text-sm text-danger" role="alert">
                    <p>{error}</p>
                    <a
                        href={SCHEMA_SQL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-soft underline"
                    >
                        Open Supabase SQL Editor
                    </a>
                </div>
            )}
        </div>
    );
}
