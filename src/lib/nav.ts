import {
    CalendarDays,
    Film,
    Flame,
    Search,
    Sparkles,
    Stars,
    Tv,
    type LucideIcon,
} from "lucide-react";

export type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
};

/** Primary browse navigation (profile lives only in AuthMenu). */
export const navItems: NavItem[] = [
    { href: "/", label: "Trending", icon: Flame },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
    { href: "/anime", label: "Anime", icon: Sparkles },
    { href: "/upcoming", label: "Upcoming", icon: CalendarDays },
    { href: "/recommendations", label: "Recommended", icon: Stars },
    { href: "/search", label: "Search", icon: Search },
];

/** Returns true when the given pathname matches a nav href. */
export function isNavActive(pathname: string, href: string): boolean {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname.startsWith(href);
}
