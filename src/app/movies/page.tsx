"use client";

import { useEffect, useRef, useState } from "react";
import CustomPagination from "@/components/CustomPagination";
import Genres from "@/components/Genres";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import LoadingGrid from "@/components/LoadingGrid";
import ContentGrid from "@/components/ContentGrid";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useGenre from "@/hooks/useGenre";
import type { ContentItem, Genre } from "@/types/tmdb";
import type { SearchMode } from "@/types/search";
import { searchPlaceholder } from "@/types/search";
import { scrollToTop } from "@/lib/dom";
import { fetchMovies, searchInScope } from "@/lib/tmdb";

/** Discover page for browsing and searching popular movies. */
export default function MoviesPage() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
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
    const genreforURL = useGenre(selectedGenres);
    const isSearching = Boolean(activeQuery);
    modeRef.current = mode;

    useEffect(() => {
        setPage(1);
        setActiveQuery(query);
        setActiveMode(modeRef.current);
    }, [query]);

    useEffect(() => {
        let cancelled = false;

        /** Loads discover or search movie results. */
        async function loadMovies() {
            setLoading(true);
            scrollToTop();

            try {
                const data = isSearching
                    ? await searchInScope(activeQuery, activeMode, "movie", page)
                    : await fetchMovies(page, genreforURL);

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

        loadMovies();

        return () => {
            cancelled = true;
        };
    }, [genreforURL, page, activeQuery, activeMode, isSearching]);

    return (
        <div>
            <PageHeader
                title="Discover Movies"
                subtitle="Browse popular films and filter by the genres you love."
            />
            <PageSearch
                value={searchText}
                onChange={setSearchText}
                placeholder={searchPlaceholder(mode, "movie")}
                mode={mode}
                onModeChange={setMode}
            />
            {!isSearching && (
                <Genres
                    type="movie"
                    selectedGenres={selectedGenres}
                    setSelectedGenres={setSelectedGenres}
                    genres={genres}
                    setGenres={setGenres}
                    setPage={setPage}
                />
            )}
            {loading ? (
                <LoadingGrid />
            ) : content.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                    {isSearching
                        ? `No movies matched “${activeQuery}”.`
                        : "No movies found."}
                </p>
            ) : (
                <ContentGrid items={content} mediaType="movie" />
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
