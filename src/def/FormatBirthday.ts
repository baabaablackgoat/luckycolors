import { BirthdayResponse } from "./DatabaseWrapper.js";
import { Lang } from "../lang/LanguageProvider.js";
import { numberToPosition } from "./NumberToPosition.js";

function birthdayToDate(birthday: BirthdayResponse): Date {
    return new Date(
        `${birthday.year ?? 1900}-${birthday.month}-${birthday.day}`
    );
}

export function formatBirthday(birthday: BirthdayResponse) {
    if (birthday === null) return Lang("birthday_format_noneSet");
    const date = birthdayToDate(birthday);
    if (birthday.year === null)
        return date.toLocaleString("en-US", { month: "short", day: "numeric" });

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Returns a correctly formatted string like "25th" if a valid birthday was supplied
 * @param birthday
 */
export function formatBirthdayAge(birthday: BirthdayResponse): string | null {
    if (!birthday.year) return null;
    const age = new Date().getFullYear() - birthday.year;
    return numberToPosition(age);
}

export function birthdayIsChangeable(birthday: BirthdayResponse) {
    return birthday === null || birthday.year === null;
}

export function isLeapYear(date?: Date) {
    if (!date) date = new Date();
    const year = date.getFullYear();
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

export function isDangerousLeapBirthday(birthday: BirthdayResponse): boolean {
    return birthday.month === 2 && birthday.day === 29 && !isLeapYear();
}

/**
 * Returns true if the passed date is the 28th of february in a non-leap year, forcing us to have to check for people who are born on the 29th.
 * @param date The date to check against
 */
export function isDangerousLeapDay(date: Date): boolean {
    return date.getMonth() === 1 && date.getDate() === 28 && !isLeapYear(date);
}

/**
 * Accounts for leap year birthdays by modifying the birthday object to the 28th of february if the current year is NOT a leap year.
 * @param birthday The birthday to check against
 */
function birthdayAccountedForLeapYear(
    birthday: BirthdayResponse
): BirthdayResponse {
    if (isDangerousLeapBirthday(birthday))
        return { month: 2, day: 28, year: birthday.year };
    return birthday;
}

/**
 * Checks whether the user has their birthday today, accounting for leap year children.
 * @param birthday The birthday to check against
 */
export function birthdayIsToday(birthday: BirthdayResponse): boolean {
    if (!birthday) return false;
    const now = new Date();
    const accountedBirthday = birthdayAccountedForLeapYear(birthday);
    return (
        accountedBirthday &&
        accountedBirthday.day === now.getDate() &&
        accountedBirthday.month === now.getMonth() + 1
    );
}
