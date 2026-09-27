"use client";

import type { ContentItem } from "@/types/tmdb";
import SingleContent from "@/components/SingleContent";
import { getContentTitle } from "@/lib/format";

type ContentGridProps = {
    items: ContentItem[];
    mediaType?: string;
};

/** Renders a responsive grid of content poster cards. */
export default function ContentGrid({ items, mediaType }: ContentGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item, index) => (
                <SingleContent
                    key={`${item.media_type || mediaType || "item"}-${item.id}`}
                    id={item.id}
                    poster={item.poster_path}
                    title={getContentTitle(item)}
                    date={item.first_air_date || item.release_date}
                    media_type={mediaType || item.media_type || "movie"}
                    vote_average={item.vote_average}
                    index={index}
                />
            ))}
        </div>
    );
}
