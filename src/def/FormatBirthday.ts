import { BirthdayResponse } from "./DatabaseWrapper";
import { Lang } from "../lang/LanguageProvider";

export function formatBirthday(birthday: BirthdayResponse) {
    if (birthday === null) return Lang("birthday_format_noneSet");
    const date = new Date(
        `${birthday.year ?? 1900}-${birthday.month}-${birthday.day}`
    );
    if (birthday.year === null)
        return date.toLocaleString("en-US", { month: "short", day: "numeric" });

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function birthdayIsChangeable(birthday: BirthdayResponse) {
    return birthday === null || birthday.year === null;
}
