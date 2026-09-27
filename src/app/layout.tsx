import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Movies Hub",
    description: "Discover trending movies and TV series",
};

/** Root layout wrapping every page with fonts, header, and mobile nav. */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            className={outfit.variable}
        >
            <body className="min-h-screen font-sans antialiased">
                <SiteHeader />
                <main className="min-h-screen pb-24 pt-20 text-foreground md:pb-10 md:pt-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
                <MobileNav />
            </body>
        </html>
    );
}
