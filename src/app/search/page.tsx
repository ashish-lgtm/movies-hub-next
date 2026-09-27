"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import CustomPagination from "@/components/CustomPagination";
import ContentGrid from "@/components/ContentGrid";
import PageHeader from "@/components/PageHeader";
import LoadingGrid from "@/components/LoadingGrid";
import SearchFilter from "@/components/SearchFilter";
import type { ContentItem } from "@/types/tmdb";
import type { SearchMode } from "@/types/search";
import { searchPlaceholder } from "@/types/search";
import { scrollToTop } from "@/lib/dom";
import {
    clearRecentSearches,
    loadRecentSearches,
    saveRecentSearch,
} from "@/lib/recentSearches";
import { searchInScope } from "@/lib/tmdb";

/** Search page with title / actor / director modes and recent queries. */
export default function SearchPage() {
    const [type, setType] = useState(0);
    const [mode, setMode] = useState<SearchMode>("title");
    const [appliedMode, setAppliedMode] = useState<SearchMode>("title");
    const [searchText, setSearchText] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [page, setPage] = useState(1);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [numOfPages, setNumOfPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [matchedPerson, setMatchedPerson] = useState<string | null>(null);
    const [recent, setRecent] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const modeRef = useRef(mode);
    const mediaScope = type ? "tv" : "movie";
    modeRef.current = mode;

    useEffect(() => {
        setRecent(loadRecentSearches());
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchText.trim());
            setAppliedMode(modeRef.current);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        setPage(1);
    }, [type]);

    /** Fetches search results for the current query, mode, type, and page. */
    const fetchSearch = useCallback(async () => {
        if (!debouncedQuery) {
            setContent([]);
            setNumOfPages(0);
            setHasSearched(false);
            setMatchedPerson(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const data = await searchInScope(
                debouncedQuery,
                appliedMode,
                mediaScope,
                page
            );
            setContent(data.results);
            setNumOfPages(data.total_pages);
            setMatchedPerson(
                appliedMode === "title" ? null : debouncedQuery
            );
            saveRecentSearch(debouncedQuery);
            setRecent(loadRecentSearches());
        } catch (error) {
            console.error(error);
            setContent([]);
            setNumOfPages(0);
            setMatchedPerson(null);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, appliedMode, mediaScope, page]);

    useEffect(() => {
        if (!debouncedQuery) {
            fetchSearch();
            return;
        }

        scrollToTop();
        fetchSearch();
    }, [fetchSearch, debouncedQuery]);

    /** Applies a recent query to the search input. */
    function applyRecent(query: string) {
        setSearchText(query);
        setDebouncedQuery(query);
        setPage(1);
    }

    /** Clears the current search input and results. */
    function clearSearch() {
        setSearchText("");
        setDebouncedQuery("");
        setContent([]);
        setHasSearched(false);
        setNumOfPages(0);
        setMatchedPerson(null);
        inputRef.current?.focus();
    }

    /** Clears stored recent searches from localStorage. */
    function handleClearRecent() {
        clearRecentSearches();
        setRecent([]);
    }

    /** Switches between movie and TV search scopes. */
    function handleTypeChange(nextType: number) {
        setType(nextType);
        setPage(1);
    }

    const emptyLabel =
        appliedMode === "actor"
            ? "No titles found for that actor"
            : appliedMode === "director"
              ? "No titles found for that director"
              : type
                ? "No series found"
                : "No movies found";

    return (
        <div>
            <PageHeader
                title="Search"
                subtitle="Find by title, actor, or director — results update as you type."
            />

            <div className="mb-6 animate-fade-up">
                <div className="flex items-stretch gap-2">
                    <div className="relative flex min-w-0 flex-1 items-center">
                        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted" />
                        <input
                            ref={inputRef}
                            className="w-full border border-border bg-surface py-4 pl-12 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
                            placeholder={searchPlaceholder(mode, mediaScope)}
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            aria-label="Search query"
                        />
                        {searchText && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 rounded p-1.5 text-muted transition-colors hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <SearchFilter mode={mode} onChange={setMode} />
                </div>

                <div className="mt-3 flex rounded border border-border bg-surface p-1">
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                            type === 0
                                ? "bg-accent text-background hover:bg-accent-soft"
                                : "text-muted hover:bg-background/50 hover:text-foreground"
                        }`}
                        onClick={() => handleTypeChange(0)}
                    >
                        Movies
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                            type === 1
                                ? "bg-accent text-background hover:bg-accent-soft"
                                : "text-muted hover:bg-background/50 hover:text-foreground"
                        }`}
                        onClick={() => handleTypeChange(1)}
                    >
                        TV Series
                    </button>
                </div>
            </div>

            {!hasSearched && !loading && recent.length > 0 && (
                <div className="mb-8 animate-fade-up">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-muted">
                            <Clock className="h-3.5 w-3.5" />
                            Recent
                        </p>
                        <button
                            type="button"
                            onClick={handleClearRecent}
                            className="text-xs text-muted transition-colors hover:text-foreground"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recent.map((query) => (
                            <button
                                key={query}
                                type="button"
                                onClick={() => applyRecent(query)}
                                className="border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent-soft"
                            >
                                {query}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!hasSearched && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center border border-border bg-surface">
                        <Search className="h-7 w-7 text-accent" />
                    </div>
                    <h2 className="text-xl font-semibold">
                        Start typing to explore
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-muted">
                        Search by title, actor, or director. Switch between
                        movies and series anytime.
                    </p>
                </div>
            )}

            {loading && <LoadingGrid count={8} />}

            {!loading && hasSearched && content.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                    <h2 className="text-xl font-semibold">
                        {emptyLabel}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        Nothing matched &ldquo;{debouncedQuery}&rdquo;. Try another
                        name or title.
                    </p>
                </div>
            )}

            {!loading && content.length > 0 && (
                <>
                    <p className="mb-4 text-sm text-muted">
                        {appliedMode === "title" ? (
                            <>
                                Results for{" "}
                                <span className="text-foreground">
                                    &ldquo;{debouncedQuery}&rdquo;
                                </span>
                            </>
                        ) : (
                            <>
                                {appliedMode === "actor"
                                    ? "Titles with"
                                    : "Directed by"}{" "}
                                <span className="text-foreground">
                                    {matchedPerson || debouncedQuery}
                                </span>
                            </>
                        )}
                    </p>
                    <ContentGrid
                        items={content}
                        mediaType={type ? "tv" : "movie"}
                    />
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
