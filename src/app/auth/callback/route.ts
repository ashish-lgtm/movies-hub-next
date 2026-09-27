import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";

/** Handles the Google OAuth redirect and sends new users to profile setup. */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/profile";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                try {
                    const profile = await getProfile(supabase, user.id);

                    if (!profile) {
                        return NextResponse.redirect(
                            `${origin}/complete-profile`
                        );
                    }
                } catch {
                    return NextResponse.redirect(`${origin}/complete-profile`);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth`);
}
