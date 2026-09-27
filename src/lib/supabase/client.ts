import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Creates a Supabase client for use in browser Client Components. */
export function createClient() {
    const { url, key } = getSupabaseEnv();
    return createBrowserClient(url, key);
}
