"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Genre } from "@/types/tmdb";
import { fetchGenres } from "@/lib/tmdb";

type GenresProps = {
    selectedGenres: Genre[];
    setSelectedGenres: (genres: Genre[]) => void;
    genres: Genre[];
    setGenres: (genres: Genre[]) => void;
    type: "movie" | "tv";
    setPage: (page: number) => void;
};

/** Genre filter chips for discover movies and series pages. */
export default function Genres({
    selectedGenres,
    setSelectedGenres,
    genres,
    setGenres,
    type,
    setPage,
}: GenresProps) {
    /** Adds a genre to the selected filter list. */
    function handleAdd(genre: Genre) {
        setSelectedGenres([...selectedGenres, genre]);
        setGenres(genres.filter((item) => item.id !== genre.id));
        setPage(1);
    }

    /** Removes a genre from the selected filter list. */
    function handleRemove(genre: Genre) {
        setSelectedGenres(
            selectedGenres.filter((selected) => selected.id !== genre.id)
        );
        setGenres([...genres, genre]);
        setPage(1);
    }

    useEffect(() => {
        /** Loads available genres for the current media type. */
        async function loadGenres() {
            const list = await fetchGenres(type);
            setGenres(list);
        }

        loadGenres();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    return (
        <div className="mb-8 flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
                <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleRemove(genre)}
                    className="inline-flex items-center gap-1.5 border border-accent bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-soft transition-colors hover:bg-accent/25"
                >
                    {genre.name}
                    <X className="h-3 w-3" />
                </button>
            ))}
            {genres.map((genre) => (
                <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleAdd(genre)}
                    className="inline-flex items-center border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted hover:text-foreground"
                >
                    {genre.name}
                </button>
            ))}
        </div>
    );
}
