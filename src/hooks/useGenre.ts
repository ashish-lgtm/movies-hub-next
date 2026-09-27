import type { Genre } from "@/types/tmdb";

/** Builds a comma-separated genre id string for TMDB discover requests. */
const useGenre = (selectedGenres: Genre[]): string => {
    if (selectedGenres.length < 1) {
        return "";
    }

    return selectedGenres.map((genre) => genre.id).join(",");
};

export default useGenre;
