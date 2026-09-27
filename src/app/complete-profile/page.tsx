"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import DobPicker from "@/components/DobPicker";
import PageHeader from "@/components/PageHeader";
import { isValidDob } from "@/lib/age";
import { getProfile, upsertProfile } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/client";

/** Collects or updates name, date of birth, and optional phone. */
export default function CompleteProfilePage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        /** Loads the signed-in user and prefills any existing profile. */
        async function bootstrap() {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();

            if (cancelled) {
                return;
            }

            if (!data.user) {
                router.replace("/login");
                return;
            }

            try {
                const existing = await getProfile(supabase, data.user.id);

                if (existing) {
                    if (!cancelled) {
                        setIsEditing(true);
                        setFullName(existing.full_name);
                        setDateOfBirth(existing.date_of_birth);
                        setPhone(existing.phone ?? "");
                    }
                } else {
                    const googleName =
                        (data.user.user_metadata?.full_name as string | undefined) ||
                        (data.user.user_metadata?.name as string | undefined) ||
                        "";

                    if (!cancelled) {
                        setFullName(googleName);
                    }
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError(
                        "Could not load profile. Make sure you ran supabase/profiles.sql."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, [router]);

    /** Saves profile details and continues to the library page. */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!fullName.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!dateOfBirth || !isValidDob(dateOfBirth)) {
            setError("Please enter a valid date of birth.");
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (!data.user) {
            setSaving(false);
            router.replace("/login");
            return;
        }

        try {
            await upsertProfile(supabase, data.user.id, {
                fullName,
                dateOfBirth,
                phone,
            });
            router.replace("/profile");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(
                "Could not save profile. Run supabase/profiles.sql in the SQL Editor if you haven't."
            );
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-md">
                <PageHeader title="Almost there" subtitle="Loading…" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md">
            <PageHeader
                title={isEditing ? "Edit profile" : "Complete your profile"}
                subtitle={
                    isEditing
                        ? "Update your details anytime."
                        : "Tell us a bit about you before you start saving titles."
                }
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-5 border border-border bg-surface p-6 animate-fade-up"
            >
                <label className="block">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
                        Full name
                    </span>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="w-full border border-border bg-background px-3 py-3 text-foreground outline-none focus:border-accent"
                        autoComplete="name"
                    />
                </label>

                <DobPicker value={dateOfBirth} onChange={setDateOfBirth} />

                <label className="block">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
                        Phone number{" "}
                        <span className="normal-case tracking-normal">(optional)</span>
                    </span>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full border border-border bg-background px-3 py-3 text-foreground outline-none focus:border-accent"
                        autoComplete="tel"
                    />
                </label>

                {error && (
                    <p className="text-sm text-danger" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-accent py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-soft disabled:opacity-60"
                >
                    {saving ? "Saving…" : isEditing ? "Save changes" : "Continue"}
                </button>
            </form>
        </div>
    );
}
