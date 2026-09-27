"use client";

import { useEffect, useState } from "react";
import AliceCarousel from "react-alice-carousel";
import type { CastMember } from "@/types/tmdb";
import CastSlide from "@/components/CastSlide";
import { fetchCredits } from "@/lib/tmdb";

type CarouselProps = {
    id: number;
    media_type: string;
};

/** Auto-playing cast carousel used inside the content modal. */
export default function Carousel({ id, media_type }: CarouselProps) {
    const [credits, setCredits] = useState<CastMember[]>([]);

    useEffect(() => {
        /** Loads cast credits for the current title. */
        async function loadCredits() {
            const cast = await fetchCredits(media_type, id);
            setCredits(cast);
        }

        loadCredits();
    }, [id, media_type]);

    const items = credits
        .slice(0, 16)
        .map((member) => <CastSlide key={member.id} member={member} />);

    const responsive = {
        0: { items: 3 },
        512: { items: 5 },
        1024: { items: 6 },
    };

    if (!items.length) {
        return (
            <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="skeleton h-20 w-16 shrink-0 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <AliceCarousel
            mouseTracking
            infinite
            disableDotsControls
            disableButtonsControls
            responsive={responsive}
            items={items}
            autoPlay
            autoPlayInterval={2400}
        />
    );
}
