"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthMenu from "@/components/AuthMenu";
import { isNavActive, navItems } from "@/lib/nav";
import { scrollToTop } from "@/lib/dom";

/** Fixed top brand header with desktop navigation links. */
export default function SiteHeader() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 z-[100] w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="group flex shrink-0 items-baseline gap-2 transition-opacity hover:opacity-90"
                >
                    <span className="text-xl font-bold tracking-normal text-foreground transition-colors group-hover:text-accent sm:text-2xl">
                        Movies Hub
                    </span>
                    <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted sm:inline">
                        Cinema
                    </span>
                </button>

                <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = isNavActive(pathname, href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium transition-colors lg:gap-2 lg:px-3 ${
                                    active
                                        ? "text-accent-soft"
                                        : "text-muted hover:text-foreground"
                                }`}
                            >
                                <Icon
                                    className="h-4 w-4"
                                    strokeWidth={active ? 2.25 : 1.75}
                                />
                                {label}
                                {active && (
                                    <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <AuthMenu />
            </div>
        </header>
    );
}
