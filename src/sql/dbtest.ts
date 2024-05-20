import { DataStorage } from "../def/DatabaseWrapper.js";
const noHidden = await DataStorage.listAllShopItems([], 0, false);
const hidden = await DataStorage.listAllShopItems([], 0, true);
