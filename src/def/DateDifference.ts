/**
 * Creates a new date with reduced precision down to days only. Based on UTC.
 * @param date
 */
export function dateDayReducer(date: Date): Date {
    let mutableDate = new Date(date);
    mutableDate.setUTCHours(0);
    mutableDate.setUTCMinutes(0);
    mutableDate.setUTCSeconds(0);
    mutableDate.setUTCMilliseconds(0);
    return mutableDate;
}
/**
 * Calculates the difference between two dates, in whole days only, dropping any partial days.
 * Uses the UTC representation of a date.
 * (The difference between Jan 1st, 23:59 and Jan 2nd, 00:00 would still be one day.)
 * Returns a positive value if date B is in the future compared to date A, and negative if the inverse is true.
 * @param a The first date.
 * @param b The second date.
 * @constructor
 */
export function getDayDifference(a: Date, b: Date): number {
    const a_daysOnly = dateDayReducer(a);
    const b_daysOnly = dateDayReducer(b);
    return (b_daysOnly.getTime() - a_daysOnly.getTime()) / 86400000;
}

console.log(dateDayReducer(new Date()));
