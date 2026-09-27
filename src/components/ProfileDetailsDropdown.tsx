"use client";

import Link from "next/link";
import { ChevronDown, Pencil } from "lucide-react";
import { getAgeFromDob } from "@/lib/age";
import { formatDisplayDate } from "@/lib/dateFormat";
import type { Profile } from "@/types/profile";

type ProfileDetailsDropdownProps = {
    profile: Profile;
    open: boolean;
    onToggle: () => void;
};

/** Collapsible profile-details panel with an edit action. */
export default function ProfileDetailsDropdown({
    profile,
    open,
    onToggle,
}: ProfileDetailsDropdownProps) {
    const age = getAgeFromDob(profile.date_of_birth);

    return (
        <div className="mb-6 border border-border bg-surface animate-fade-up">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-background/40"
            >
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                        Profile details
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                        {profile.full_name} · {age} yrs
                    </p>
                </div>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${
                        open ? "rotate-180 text-accent" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="border-t border-border px-4 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-muted">
                                Full name
                            </p>
                            <p className="mt-1 text-foreground">{profile.full_name}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-muted">
                                Age
                            </p>
                            <p className="mt-1 text-foreground">{age} years</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-muted">
                                Date of birth
                            </p>
                            <p className="mt-1 text-foreground">
                                {formatDisplayDate(profile.date_of_birth)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-muted">
                                Phone
                            </p>
                            <p className="mt-1 text-foreground">
                                {profile.phone || "Not added"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <Link
                            href="/complete-profile"
                            className="inline-flex items-center gap-2 border border-accent px-4 py-2.5 text-sm font-medium text-accent-soft transition-colors hover:bg-accent/10"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit profile
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
