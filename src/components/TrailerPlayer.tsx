"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

type TrailerPlayerProps = {
    videoKey: string;
    title: string;
};

/** In-page YouTube trailer player toggled from the Watch Trailer button. */
export default function TrailerPlayer({ videoKey, title }: TrailerPlayerProps) {
    const [playing, setPlaying] = useState(false);

    /** Starts the embedded trailer. */
    function handlePlay() {
        setPlaying(true);
    }

    /** Stops the trailer and hides the player. */
    function handleStop() {
        setPlaying(false);
    }

    if (!playing) {
        return (
            <button
                type="button"
                onClick={handlePlay}
                className="inline-flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft sm:w-auto"
            >
                <Play className="h-4 w-4 fill-current" />
                Watch Trailer
            </button>
        );
    }

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                    Trailer
                </p>
                <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                    aria-label="Close trailer"
                >
                    <X className="h-3.5 w-3.5" />
                    Close
                </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden border border-border bg-black">
                <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={`${title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            </div>
        </div>
    );
}
