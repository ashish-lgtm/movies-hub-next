"use client";

import { useEffect, useRef, useState } from "react";
import CustomPagination from "@/components/CustomPagination";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import LoadingGrid from "@/components/LoadingGrid";
import ContentGrid from "@/components/ContentGrid";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { ContentItem } from "@/types/tmdb";
import type { SearchMode } from "@/types/search";
import { searchPlaceholder } from "@/types/search";
import { scrollToTop } from "@/lib/dom";
import { fetchUpcoming, searchInScope } from "@/lib/tmdb";

/** Browse and search upcoming movies, series, and anime. */
export default function UpcomingPage() {
    const [page, setPage] = useState(1);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [numOfPages, setNumOfPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [mode, setMode] = useState<SearchMode>("title");
    const modeRef = useRef(mode);
    const query = useDebouncedValue(searchText.trim());
    const [activeQuery, setActiveQuery] = useState("");
    const [activeMode, setActiveMode] = useState<SearchMode>("title");
    const isSearching = Boolean(activeQuery);
    modeRef.current = mode;

    useEffect(() => {
        setPage(1);
        setActiveQuery(query);
        setActiveMode(modeRef.current);
    }, [query]);

    useEffect(() => {
        let cancelled = false;

        /** Loads discover or search upcoming results. */
        async function loadUpcoming() {
            setLoading(true);
            scrollToTop();

            try {
                const data = isSearching
                    ? await searchInScope(
                          activeQuery,
                          activeMode,
                          "upcoming",
                          page
                      )
                    : await fetchUpcoming(page);

                if (!cancelled) {
                    const pages = data.total_pages;
                    setContent(data.results);
                    setNumOfPages(pages);

                    if (pages > 0 && page > pages) {
                        setPage(pages);
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadUpcoming();

        return () => {
            cancelled = true;
        };
    }, [page, activeQuery, activeMode, isSearching]);

    return (
        <div>
            <PageHeader
                title="Upcoming"
                subtitle="Coming soon across movies, series, and anime — sorted by release date."
            />
            <PageSearch
                value={searchText}
                onChange={setSearchText}
                placeholder={searchPlaceholder(mode, "upcoming")}
                mode={mode}
                onModeChange={setMode}
            />
            {loading ? (
                <LoadingGrid />
            ) : content.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                    {isSearching
                        ? `No upcoming titles matched “${activeQuery}”.`
                        : "No upcoming titles found."}
                </p>
            ) : (
                <ContentGrid items={content} />
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
