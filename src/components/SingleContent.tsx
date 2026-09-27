"use client";

import Image from "next/image";
import { img_300, unavailable } from "@/config/config";
import ContentModal from "@/components/ContentModal";
import { getMediaLabel, getYearFromDate, isUnreleasedDate } from "@/lib/format";

type SingleContentProps = {
    id: number;
    poster: string | null;
    title: string;
    date?: string;
    media_type: string;
    vote_average: number;
    index?: number;
};

/** Poster card that opens the content detail modal on click. */
export default function SingleContent({
    id,
    poster,
    title,
    date,
    media_type,
    vote_average,
    index = 0,
}: SingleContentProps) {
    const score = Number(vote_average);
    const high = score > 6;
    const year = getYearFromDate(date);
    const showRating = !isUnreleasedDate(date) && score > 0;

    return (
        <ContentModal media_type={media_type} id={id}>
            <article
                className="group animate-fade-up cursor-pointer"
                style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            >
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                    <Image
                        src={poster ? `${img_300}${poster}` : unavailable}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        unoptimized={!poster}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                    {showRating && (
                        <span
                            className={`absolute right-2 top-2 z-10 px-2 py-0.5 text-xs font-semibold tracking-wide ${
                                high
                                    ? "bg-accent text-background"
                                    : "bg-danger text-foreground"
                            }`}
                        >
                            {score.toFixed(1)}
                        </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-90 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
                            {title}
                        </h3>
                        <div className="mt-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted sm:text-xs">
                            <span>{getMediaLabel(media_type)}</span>
                            <span>{year}</span>
                        </div>
                    </div>
                </div>
            </article>
        </ContentModal>
    );
}
