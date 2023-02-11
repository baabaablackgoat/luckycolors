import { DataStorage } from "../def/DatabaseWrapper.js";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(100);
console.log("balance of bar is", await DataStorage.checkUserBalance("bar"));
console.log(await DataStorage.listAllShopItems());
