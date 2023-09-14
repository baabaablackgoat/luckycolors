import { DataStorage } from "../def/DatabaseWrapper.js";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(100);
await DataStorage.setBirthday("0", 3, 12);
console.log("birthday of userID 0 is", await DataStorage.getBirthday("0"));
