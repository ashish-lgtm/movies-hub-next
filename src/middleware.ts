import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Next.js middleware entrypoint that keeps the auth session fresh. */
export async function middleware(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
