"use client";

import { useEffect, useState } from "react";
import CustomPagination from "@/components/CustomPagination";
import PageHeader from "@/components/PageHeader";
import LoadingGrid from "@/components/LoadingGrid";
import ContentGrid from "@/components/ContentGrid";
import type { ContentItem } from "@/types/tmdb";
import { fetchTrending } from "@/lib/tmdb";

/** Home page showing daily trending movies and TV shows. */
export default function TrendingPage() {
    const [page, setPage] = useState(1);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        /** Loads trending results for the current page. */
        async function loadTrending() {
            setLoading(true);

            try {
                const results = await fetchTrending(page);

                if (!cancelled) {
                    setContent(results);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadTrending();

        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <div>
            <PageHeader
                title="Trending"
                subtitle="What everyone is watching right now across movies and TV."
            />

            {loading ? <LoadingGrid /> : <ContentGrid items={content} />}

            <CustomPagination setPage={setPage} page={page} />
        </div>
    );
}
