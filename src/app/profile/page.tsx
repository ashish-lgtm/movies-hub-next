"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import PageHeader from "@/components/PageHeader";
import LoadingGrid from "@/components/LoadingGrid";
import LibraryMovieCard from "@/components/LibraryMovieCard";
import ProfileDetailsDropdown from "@/components/ProfileDetailsDropdown";
import { listUserMovies } from "@/lib/library";
import { getProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";
import type { UserMovie } from "@/types/library";

type LibraryTab = "watchlist" | "watched";

/** Profile page showing collapsible details plus watchlist and watched titles. */
export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [tab, setTab] = useState<LibraryTab>("watchlist");
    const [watchlist, setWatchlist] = useState<UserMovie[]>([]);
    const [watched, setWatched] = useState<UserMovie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        /** Loads the session, profile details, and both library lists. */
        async function loadProfile() {
            setLoading(true);
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();

            if (cancelled) {
                return;
            }

            if (!data.user) {
                router.replace("/login");
                return;
            }

            setUser(data.user);

            try {
                const existing = await getProfile(supabase, data.user.id);

                if (!existing) {
                    router.replace("/complete-profile");
                    return;
                }

                const [watchlistItems, watchedItems] = await Promise.all([
                    listUserMovies(supabase, data.user.id, "watchlist"),
                    listUserMovies(supabase, data.user.id, "watched"),
                ]);

                if (!cancelled) {
                    setProfile(existing);
                    setWatchlist(watchlistItems);
                    setWatched(watchedItems);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [router]);

    /** Switches the visible library tab. */
    function handleTabChange(next: LibraryTab) {
        setTab(next);
    }

    /** Toggles the profile-details dropdown open or closed. */
    function handleDetailsToggle() {
        setDetailsOpen((current) => !current);
    }

    if (loading) {
        return (
            <div>
                <PageHeader title="Profile" subtitle="Loading your library…" />
                <LoadingGrid count={8} />
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    const items = tab === "watchlist" ? watchlist : watched;

    return (
        <div>
            <PageHeader title={profile.full_name} subtitle="Your personal library" />

            <ProfileDetailsDropdown
                profile={profile}
                open={detailsOpen}
                onToggle={handleDetailsToggle}
            />

            <div className="mb-6 flex rounded border border-border bg-surface p-1 animate-fade-up">
                <button
                    type="button"
                    onClick={() => handleTabChange("watchlist")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                        tab === "watchlist"
                            ? "bg-accent text-background hover:bg-accent-soft"
                            : "text-muted hover:bg-background/50 hover:text-foreground"
                    }`}
                >
                    To watch · {watchlist.length}
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange("watched")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                        tab === "watched"
                            ? "bg-accent text-background hover:bg-accent-soft"
                            : "text-muted hover:bg-background/50 hover:text-foreground"
                    }`}
                >
                    Watched · {watched.length}
                </button>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                    <h2 className="text-xl font-semibold">
                        {tab === "watchlist"
                            ? "Your watchlist is empty"
                            : "Nothing marked as watched yet"}
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-muted">
                        Open any title and use the library buttons to save it here.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 border border-accent px-4 py-2 text-sm font-medium text-accent-soft transition-colors hover:bg-accent/10"
                    >
                        Browse trending
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((item) => (
                        <LibraryMovieCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
