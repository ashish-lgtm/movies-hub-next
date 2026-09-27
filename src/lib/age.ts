/** Calculates age in full years from an ISO date-of-birth string (YYYY-MM-DD). */
export function getAgeFromDob(dateOfBirth: string, today = new Date()): number {
    const dob = new Date(`${dateOfBirth}T00:00:00`);

    if (Number.isNaN(dob.getTime())) {
        return 0;
    }

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }

    return Math.max(age, 0);
}

/** Returns true when a date-of-birth represents a realistic user age. */
export function isValidDob(dateOfBirth: string): boolean {
    const age = getAgeFromDob(dateOfBirth);
    return age >= 5 && age <= 120;
}
