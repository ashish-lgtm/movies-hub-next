"use client";

import { useState } from "react";
import GoogleIcon from "@/components/GoogleIcon";
import { getAuthCallbackUrl } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

type GoogleSignInButtonProps = {
    onError: (message: string) => void;
};

/** Starts the Google OAuth sign-in flow via Supabase. */
export default function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    /** Redirects the browser to Google through Supabase Auth. */
    async function handleGoogleSignIn() {
        setLoading(true);
        onError("");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: getAuthCallbackUrl(window.location.origin),
            },
        });

        if (error) {
            setLoading(false);
            onError(error.message);
        }
    }

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
            <GoogleIcon />
            {loading ? "Redirecting…" : "Continue with Google"}
        </button>
    );
}
