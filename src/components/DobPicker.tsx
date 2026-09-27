"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getAgeFromDob } from "@/lib/age";
import {
    daysInMonth,
    parseIsoDate,
    toIsoDate,
} from "@/lib/dateFormat";

type DobPickerProps = {
    value: string;
    onChange: (isoDate: string) => void;
};

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

/** Styled day / month / year picker with age shown beside the field. */
export default function DobPicker({ value, onChange }: DobPickerProps) {
    const currentYear = new Date().getFullYear();
    const parsed = parseIsoDate(value);

    const [day, setDay] = useState(parsed?.day ?? 1);
    const [month, setMonth] = useState(parsed?.month ?? 1);
    const [year, setYear] = useState(parsed?.year ?? currentYear - 18);

    const maxDay = daysInMonth(month, year);
    const age = useMemo(() => {
        if (!value) {
            return null;
        }

        return getAgeFromDob(value);
    }, [value]);

    useEffect(() => {
        const next = parseIsoDate(value);

        if (!next) {
            return;
        }

        setDay(next.day);
        setMonth(next.month);
        setYear(next.year);
    }, [value]);

    useEffect(() => {
        const safeDay = Math.min(day, maxDay);
        const iso = toIsoDate(safeDay, month, year);

        if (safeDay !== day) {
            setDay(safeDay);
        }

        if (iso !== value) {
            onChange(iso);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [day, month, year, maxDay]);

    const selectClass =
        "w-full border border-border bg-background px-3 py-3 text-foreground outline-none transition-colors hover:border-accent focus:border-accent";

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-muted">
                    <CalendarDays className="h-3.5 w-3.5 text-accent" />
                    Date of birth
                </span>
                {age !== null && (
                    <span className="border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-soft">
                        {age} years old
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <label className="block">
                    <span className="sr-only">Day</span>
                    <select
                        className={selectClass}
                        value={day}
                        onChange={(event) => setDay(Number(event.target.value))}
                        aria-label="Day"
                    >
                        {Array.from({ length: maxDay }, (_, index) => index + 1).map(
                            (item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            )
                        )}
                    </select>
                </label>

                <label className="block">
                    <span className="sr-only">Month</span>
                    <select
                        className={selectClass}
                        value={month}
                        onChange={(event) => setMonth(Number(event.target.value))}
                        aria-label="Month"
                    >
                        {MONTHS.map((name, index) => (
                            <option key={name} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="sr-only">Year</span>
                    <select
                        className={selectClass}
                        value={year}
                        onChange={(event) => setYear(Number(event.target.value))}
                        aria-label="Year"
                    >
                        {Array.from({ length: 100 }, (_, index) => currentYear - index).map(
                            (item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            )
                        )}
                    </select>
                </label>
            </div>
        </div>
    );
}
