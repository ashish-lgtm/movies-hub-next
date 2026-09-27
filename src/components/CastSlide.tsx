"use client";

import Image from "next/image";
import { img_300, noPicture } from "@/config/config";
import type { CastMember } from "@/types/tmdb";
import { preventDragStart } from "@/lib/dom";

type CastSlideProps = {
    member: CastMember;
};

/** Single cast member slide used inside the credits carousel. */
export default function CastSlide({ member }: CastSlideProps) {
    return (
        <div className="px-1.5">
            <div className="relative mx-auto mb-2 aspect-square w-full max-w-[88px] overflow-hidden rounded-lg bg-surface-2">
                <Image
                    src={
                        member.profile_path
                            ? `${img_300}${member.profile_path}`
                            : noPicture
                    }
                    alt={member.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                    onDragStart={preventDragStart}
                    unoptimized={!member.profile_path}
                />
            </div>
            <p className="line-clamp-2 text-center text-xs text-muted">{member.name}</p>
        </div>
    );
}
