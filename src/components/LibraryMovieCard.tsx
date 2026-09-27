"use client";

import Image from "next/image";
import { img_300, unavailable } from "@/config/config";
import ContentModal from "@/components/ContentModal";
import type { UserMovie } from "@/types/library";
import { getMediaLabel } from "@/lib/format";

type LibraryMovieCardProps = {
    item: UserMovie;
};

/** Poster card for a title saved in the user's library. */
export default function LibraryMovieCard({ item }: LibraryMovieCardProps) {
    return (
        <ContentModal media_type={item.media_type} id={item.tmdb_id}>
            <article className="group cursor-pointer animate-fade-up">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                    <Image
                        src={
                            item.poster_path
                                ? `${img_300}${item.poster_path}`
                                : unavailable
                        }
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        unoptimized={!item.poster_path}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                            {item.title}
                        </h3>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                            {getMediaLabel(item.media_type)}
                        </p>
                    </div>
                </div>
            </article>
        </ContentModal>
    );
}
