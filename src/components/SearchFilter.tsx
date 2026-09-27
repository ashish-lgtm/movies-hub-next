"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import type { SearchMode } from "@/types/search";
import { SEARCH_MODE_OPTIONS, searchModeLabel } from "@/types/search";

type SearchFilterProps = {
    mode: SearchMode;
    onChange: (mode: SearchMode) => void;
};

type MenuPosition = {
    top: number;
    left: number;
};

/** Filter button that opens Title / Actor / Director search options. */
export default function SearchFilter({ mode, onChange }: SearchFilterProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    /** Keeps the portaled menu aligned under the filter button. */
    function updatePosition() {
        const rect = rootRef.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const menuWidth = 200;
        const left = Math.min(
            Math.max(8, rect.right - menuWidth),
            window.innerWidth - menuWidth - 8
        );

        setPosition({
            top: rect.bottom + 8,
            left,
        });
    }

    useLayoutEffect(() => {
        if (!open) {
            return;
        }

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        /** Closes the menu when clicking outside. */
        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;

            if (
                rootRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }

            setOpen(false);
        }

        /** Closes the menu on Escape. */
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    /** Selects a search mode and closes the menu. */
    function selectMode(next: SearchMode) {
        onChange(next);
        setOpen(false);
    }

    const menu =
        open && mounted
            ? createPortal(
                  <div
                      ref={menuRef}
                      className="fixed z-[300] min-w-[12.5rem] border border-border bg-surface py-1 shadow-lg animate-fade-in"
                      style={{ top: position.top, left: position.left }}
                      role="listbox"
                      aria-label="Search by"
                  >
                      <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-muted">
                          Search by
                      </p>
                      {SEARCH_MODE_OPTIONS.map(({ id, label }) => {
                          const active = mode === id;

                          return (
                              <button
                                  key={id}
                                  type="button"
                                  role="option"
                                  aria-selected={active}
                                  onClick={() => selectMode(id)}
                                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                                      active
                                          ? "bg-accent/15 text-accent-soft"
                                          : "text-foreground hover:bg-background/60"
                                  }`}
                              >
                                  {label}
                                  {active && (
                                      <Check className="h-4 w-4 shrink-0" />
                                  )}
                              </button>
                          );
                      })}
                  </div>,
                  document.body
              )
            : null;

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`inline-flex h-full items-center gap-2 border px-3.5 py-3.5 text-sm font-medium transition-colors sm:px-4 ${
                    open || mode !== "title"
                        ? "border-accent bg-accent/10 text-accent-soft"
                        : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
                }`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Search filter: ${searchModeLabel(mode)}`}
            >
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="text-foreground">{searchModeLabel(mode)}</span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {menu}
        </div>
    );
}
