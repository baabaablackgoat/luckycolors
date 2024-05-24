import { DataStorage } from "../def/DatabaseWrapper.js";
await new Promise((resolve) => setTimeout(resolve, 1000));
console.log(await DataStorage.findAllOwners(5));
