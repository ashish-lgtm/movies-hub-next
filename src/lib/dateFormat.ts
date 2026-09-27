/** Formats an ISO date (YYYY-MM-DD) for display. */
export function formatDisplayDate(dateOfBirth: string): string {
    const date = new Date(`${dateOfBirth}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateOfBirth;
    }

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** Pads a number to two digits for ISO date parts. */
export function padDatePart(value: number): string {
    return String(value).padStart(2, "0");
}

/** Builds an ISO date string from separate day, month, and year values. */
export function toIsoDate(day: number, month: number, year: number): string {
    return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

/** Parses an ISO date into day, month, and year parts. */
export function parseIsoDate(value: string): {
    day: number;
    month: number;
    year: number;
} | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
    };
}

/** Returns the number of days in a given month/year. */
export function daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}
