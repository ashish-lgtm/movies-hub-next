"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Header auth controls with a single profile icon when signed in. */
export default function AuthMenu() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        /** Loads the initial session user. */
        async function loadUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setReady(true);
        }

        loadUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setReady(true);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    /** Signs the current user out and refreshes the app shell. */
    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
        router.refresh();
    }

    if (!ready) {
        return <div className="h-9 w-20" aria-hidden />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
                <LogIn className="h-4 w-4" />
                Sign in
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/profile"
                aria-label="Profile"
                title="Profile"
                className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
                <UserRound className="h-4 w-4" />
            </Link>
            <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="inline-flex h-9 items-center gap-2 border border-border px-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
            </button>
        </div>
    );
}
