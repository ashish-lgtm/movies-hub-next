"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { scrollToTop } from "@/lib/dom";

type CustomPaginationProps = {
    setPage: (page: number) => void;
    page?: number;
    numOfPages?: number;
};

/** Numbered pagination controls with previous and next buttons. */
export default function CustomPagination({
    setPage,
    page = 1,
    numOfPages = 10,
}: CustomPaginationProps) {
    const total = Math.max(numOfPages, 1);
    const current = Math.min(Math.max(page, 1), total);
    const windowSize = 7;
    let windowStart = Math.max(1, current - Math.floor(windowSize / 2));
    const windowEnd = Math.min(total, windowStart + windowSize - 1);
    windowStart = Math.max(1, windowEnd - windowSize + 1);
    const pages = Array.from(
        { length: windowEnd - windowStart + 1 },
        (_, index) => windowStart + index
    );

    /** Navigates to a page within the available range. */
    function go(next: number) {
        if (next < 1 || next > total) {
            return;
        }

        setPage(next);
        scrollToTop();
    }

    return (
        <div className="mt-10 flex w-full items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => go(current - 1)}
                disabled={current <= 1}
                className="flex h-10 w-10 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1">
                {pages.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => go(pageNumber)}
                        className={`flex h-10 min-w-10 items-center justify-center px-2 text-sm font-medium transition-colors ${
                            pageNumber === current
                                ? "bg-accent text-background hover:bg-accent-soft"
                                : "border border-border text-muted hover:border-accent hover:text-accent"
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => go(current + 1)}
                disabled={current >= total}
                className="flex h-10 w-10 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
