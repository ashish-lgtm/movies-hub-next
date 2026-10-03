"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { img_500, unavailable, unavailableLandscape } from "@/config/config";
import type { ContentItem, WatchAvailability } from "@/types/tmdb";
import Carousel from "@/components/Carousel";
import LibraryActions from "@/components/LibraryActions";
import TrailerPlayer from "@/components/TrailerPlayer";
import WatchProviders from "@/components/WatchProviders";
import { getContentTitle, getContentYear } from "@/lib/format";
import {
    fetchContentDetails,
    fetchTrailerKey,
    fetchWatchProviders,
} from "@/lib/tmdb";

type ContentModalProps = {
    children: ReactNode;
    media_type: string;
    id: number;
};

/** Modal dialog that shows details, cast, and trailer for a title. */
export default function ContentModal({
    children,
    media_type,
    id,
}: ContentModalProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState<ContentItem | null>(null);
    const [video, setVideo] = useState<string | undefined>();
    const [watchProviders, setWatchProviders] =
        useState<WatchAvailability | null>(null);
    const [loading, setLoading] = useState(false);

    /** Opens the detail modal. */
    function handleOpen() {
        setOpen(true);
    }

    /** Closes the detail modal. */
    function handleClose() {
        setOpen(false);
        setVideo(undefined);
        setContent(null);
        setWatchProviders(null);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;

        /** Loads detail, trailer, and watch-provider data when the modal opens. */
        async function loadDetails() {
            setLoading(true);

            try {
                const [detail, trailerKey, providers] = await Promise.all([
                    fetchContentDetails(media_type, id),
                    fetchTrailerKey(media_type, id),
                    fetchWatchProviders(media_type, id),
                ]);

                if (cancelled) {
                    return;
                }

                setContent(detail);
                setVideo(trailerKey);
                setWatchProviders(providers);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDetails();

        return () => {
            cancelled = true;
        };
    }, [open, media_type, id]);

    useEffect(() => {
        if (!open) {
            return;
        }

        /** Closes the modal when Escape is pressed. */
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    const title = content ? getContentTitle(content) : "";
    const year = content ? getContentYear(content) : "-----";

    return (
        <>
            <div onClick={handleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-3 animate-fade-in sm:p-6"
                    onClick={handleClose}
                    role="presentation"
                >
                    <div
                        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-surface animate-scale-in md:flex-row"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title || "Content details"}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute right-3 top-3 z-20 rounded-md bg-black/50 p-2 text-foreground transition-colors hover:bg-black/70"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {loading && !content ? (
                            <div className="flex h-[60vh] w-full items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                            </div>
                        ) : (
                            content && (
                                <>
                                    <div className="relative hidden w-[38%] shrink-0 md:block">
                                        <Image
                                            src={
                                                content.poster_path
                                                    ? `${img_500}${content.poster_path}`
                                                    : unavailable
                                            }
                                            alt={title}
                                            fill
                                            className="object-cover"
                                            sizes="38vw"
                                            unoptimized={!content.poster_path}
                                        />
                                    </div>

                                    <div className="relative h-44 w-full shrink-0 md:hidden">
                                        <Image
                                            src={
                                                content.backdrop_path
                                                    ? `${img_500}${content.backdrop_path}`
                                                    : unavailableLandscape
                                            }
                                            alt={title}
                                            fill
                                            className="object-cover"
                                            sizes="100vw"
                                            unoptimized={!content.backdrop_path}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                                    </div>

                                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto no-scrollbar p-5 sm:p-7">
                                        <div>
                                            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
                                                {title}{" "}
                                                <span className="font-medium text-muted">
                                                    ({year})
                                                </span>
                                            </h2>
                                            {content.tagline && (
                                                <p className="mt-2 text-sm italic text-accent-soft">
                                                    {content.tagline}
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-sm leading-relaxed text-muted sm:text-base">
                                            {content.overview}
                                        </p>

                                        <LibraryActions
                                            tmdbId={id}
                                            mediaType={media_type}
                                            title={title}
                                            posterPath={content.poster_path}
                                        />

                                        <div>
                                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-muted">
                                                Cast
                                            </p>
                                            <Carousel id={id} media_type={media_type} />
                                        </div>

                                        {video && (
                                            <TrailerPlayer
                                                videoKey={video}
                                                title={title}
                                            />
                                        )}

                                        {watchProviders && (
                                            <WatchProviders
                                                availability={watchProviders}
                                                title={title}
                                            />
                                        )}
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
