/** Prevents the browser default drag image while dragging carousel items. */
export function preventDragStart(event: { preventDefault: () => void }): void {
    event.preventDefault();
}

/** Smoothly scrolls the window to the top. */
export function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
