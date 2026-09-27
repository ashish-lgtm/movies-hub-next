import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ProfileInput } from "@/types/profile";

/** Fetches a user's profile row, or null when onboarding is incomplete. */
export async function getProfile(
    supabase: SupabaseClient,
    userId: string
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data as Profile | null) ?? null;
}

/** Creates or updates the signed-in user's profile details. */
export async function upsertProfile(
    supabase: SupabaseClient,
    userId: string,
    input: ProfileInput
): Promise<Profile> {
    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: userId,
                full_name: input.fullName.trim(),
                date_of_birth: input.dateOfBirth,
                phone: input.phone?.trim() ? input.phone.trim() : null,
            },
            { onConflict: "id" }
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Profile;
}
