/** Removes accidental wrapping quotes and whitespace from env values. */
export function cleanEnv(value: string | undefined): string {
    return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

/** Normalizes a Supabase project URL to the root host (no /rest/v1 path). */
export function normalizeSupabaseUrl(value: string): string {
    const cleaned = cleanEnv(value);

    if (!cleaned) {
        return "";
    }

    try {
        const url = new URL(cleaned);
        return `${url.protocol}//${url.host}`;
    } catch {
        return cleaned.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
    }
}

/** Returns cleaned Supabase URL and anon/publishable key from env. */
export function getSupabaseEnv(): { url: string; key: string } {
    const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!url || !key) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    }

    return { url, key };
}
