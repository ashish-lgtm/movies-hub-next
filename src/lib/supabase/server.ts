import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Creates a Supabase client for Server Components, Route Handlers, and actions. */
export async function createClient() {
    const cookieStore = await cookies();
    const { url, key } = getSupabaseEnv();

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Called from a Server Component where cookies are read-only.
                }
            },
        },
    });
}
