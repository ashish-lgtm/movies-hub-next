"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, navItems } from "@/lib/nav";

/** Fixed bottom navigation shown on small screens. */
export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 z-[100] w-full border-t border-border/80 bg-background/90 backdrop-blur-md md:hidden">
            <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = isNavActive(pathname, href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                                active
                                    ? "text-accent"
                                    : "text-muted hover:text-foreground"
                            }`}
                        >
                            <Icon
                                className="h-5 w-5"
                                strokeWidth={active ? 2.25 : 1.75}
                            />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
