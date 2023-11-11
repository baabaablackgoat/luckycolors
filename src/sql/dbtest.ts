import { DataStorage } from "../def/DatabaseWrapper.js";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(100);
// cool variables
const today = await DataStorage.getAllActiveBirthdays();
const leapYearDays = await DataStorage.getAllActiveBirthdays(
    new Date("2023-02-28")
);
const hasLeapYearDays = await DataStorage.getAllActiveBirthdays(
    new Date("2024-02-28")
);
const mine = await DataStorage.getAllActiveBirthdays(new Date("2023-12-03"));
console.log("not a leap year", leapYearDays);
console.log("in a leap year", hasLeapYearDays);
console.log("today", today);
console.log("mine", mine);
