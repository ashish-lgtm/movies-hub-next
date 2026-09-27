/** Builds the OAuth redirect URL used after Google sign-in. */
export function getAuthCallbackUrl(origin: string, next = "/profile"): string {
    return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Returns a short display label for a signed-in Supabase user. */
export function getUserLabel(user: {
    email?: string | null;
    phone?: string | null;
}): string {
    return user.email || user.phone || "Profile";
}
