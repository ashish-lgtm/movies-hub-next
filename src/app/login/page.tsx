"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import GoogleSignInButton from "@/components/GoogleSignInButton";

/** Sign-in page using Google OAuth only. */
export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);

    /** Stores or clears the shared auth error message. */
    function handleError(message: string) {
        setError(message || null);
    }

    return (
        <div className="mx-auto max-w-md">
            <PageHeader
                title="Sign in"
                subtitle="Continue with your Google account."
            />

            <div className="space-y-4 border border-border bg-surface p-6 animate-fade-up">
                <GoogleSignInButton onError={handleError} />

                {error && (
                    <p className="text-sm text-danger" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
