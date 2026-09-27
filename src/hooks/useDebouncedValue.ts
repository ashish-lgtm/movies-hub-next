"use client";

import { useEffect, useState } from "react";

/** Returns a debounced copy of the given value. */
export default function useDebouncedValue<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
