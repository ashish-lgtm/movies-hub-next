"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomPagination from "@/components/CustomPagination";
import PageHeader from "@/components/PageHeader";
import LoadingGrid from "@/components/LoadingGrid";
import ContentGrid from "@/components/ContentGrid";
import { listAllUserMovies } from "@/lib/library";
import { createClient } from "@/lib/supabase/client";
import { fetchLibraryRecommendations } from "@/lib/tmdb";
import { scrollToTop } from "@/lib/dom";
import type { ContentItem } from "@/types/tmdb";

/** Personalized recommendations based on watchlist and watched titles. */
export default function RecommendationsPage() {
    const [page, setPage] = useState(1);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [numOfPages, setNumOfPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [signedIn, setSignedIn] = useState(false);
    const [seedCount, setSeedCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        /** Loads the user's library, then TMDB recommendations from those seeds. */
        async function loadRecommendations() {
            setLoading(true);
            scrollToTop();

            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getUser();

                if (cancelled) {
                    return;
                }

                if (!data.user) {
                    setSignedIn(false);
                    setSeedCount(0);
                    setContent([]);
                    setNumOfPages(0);
                    return;
                }

                setSignedIn(true);

                const library = await listAllUserMovies(supabase, data.user.id);

                if (cancelled) {
                    return;
                }

                setSeedCount(library.length);

                if (library.length === 0) {
                    setContent([]);
                    setNumOfPages(0);
                    return;
                }

                const recommendations = await fetchLibraryRecommendations(
                    library.map((item) => ({
                        tmdb_id: item.tmdb_id,
                        media_type: item.media_type,
                    })),
                    page
                );

                if (!cancelled) {
                    setContent(recommendations.results);
                    setNumOfPages(recommendations.total_pages);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setContent([]);
                    setNumOfPages(0);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <div>
            <PageHeader
                title="Recommendations"
                subtitle="Picks inspired by what you’ve added to your watchlist and watched list."
            />

            {loading ? (
                <LoadingGrid />
            ) : !signedIn ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                    <h2 className="text-xl font-semibold">Sign in for personal picks</h2>
                    <p className="mt-2 max-w-sm text-sm text-muted">
                        Recommendations use your watchlist and watched titles.
                    </p>
                    <Link
                        href="/login"
                        className="mt-6 border border-accent px-4 py-2 text-sm font-medium text-accent-soft transition-colors hover:bg-accent/10"
                    >
                        Sign in
                    </Link>
                </div>
            ) : seedCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                    <h2 className="text-xl font-semibold">Your library is empty</h2>
                    <p className="mt-2 max-w-sm text-sm text-muted">
                        Add titles to your watchlist or mark them as watched to unlock
                        recommendations.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/movies"
                            className="border border-accent px-4 py-2 text-sm font-medium text-accent-soft transition-colors hover:bg-accent/10"
                        >
                            Browse movies
                        </Link>
                        <Link
                            href="/profile"
                            className="border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                        >
                            Open profile
                        </Link>
                    </div>
                </div>
            ) : content.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                    No recommendations yet — try adding a few more titles.
                </p>
            ) : (
                <>
                    <p className="mb-4 text-sm text-muted">
                        Based on {seedCount} title{seedCount === 1 ? "" : "s"} in your
                        library
                    </p>
                    <ContentGrid items={content} />
                </>
            )}

            {numOfPages > 1 && (
                <CustomPagination
                    setPage={setPage}
                    page={page}
                    numOfPages={numOfPages}
                />
            )}
        </div>
    );
}
