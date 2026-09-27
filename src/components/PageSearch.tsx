"use client";

import { Search, X } from "lucide-react";
import SearchFilter from "@/components/SearchFilter";
import type { SearchMode } from "@/types/search";

type PageSearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    mode?: SearchMode;
    onModeChange?: (mode: SearchMode) => void;
};

/** Debounced-friendly search input used on browse pages. */
export default function PageSearch({
    value,
    onChange,
    placeholder = "Search…",
    mode,
    onModeChange,
}: PageSearchProps) {
    return (
        <div className="mb-6 overflow-visible animate-fade-up">
            <div className="relative z-20 flex items-stretch gap-2">
                <div className="relative flex min-w-0 flex-1 items-center">
                    <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted" />
                    <input
                        className="w-full border border-border bg-surface py-3.5 pl-12 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        aria-label="Search"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute right-3 rounded p-1.5 text-muted transition-colors hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                {mode && onModeChange && (
                    <SearchFilter mode={mode} onChange={onModeChange} />
                )}
            </div>
        </div>
    );
}
