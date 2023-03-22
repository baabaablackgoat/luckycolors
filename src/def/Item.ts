import { DataStorage } from "./DatabaseWrapper.js";

export type ItemType = "role" | "other";

export interface IItemData {
    roleID?: string;
    other?: {};
}
export class ItemData implements IItemData {
    roleID?: string;
    other?: {};

    constructor(roleID?: string, other?: {}) {
        this.roleID = roleID;
        this.other = other;
    }
}

class ItemError extends Error {}

export interface ItemDBResponse {
    itemID?: number;
    itemName?: string;
    value?: number;
    itemData?: string;
    itemType?: string;
}

export class Item {
    itemName: string;
    itemType: ItemType;
    itemData: ItemData;
    // These values aren't always necessary
    itemID?: number;
    value?: number;

    // TODO: I'm not confident with overloads in Typescript, so this will have to do for now. Rework this into an overload!
    static createFromDBResponse(dbResponse: ItemDBResponse): Item {
        return new Item(
            dbResponse.itemName ?? "unknown",
            dbResponse.itemType ?? "unknown",
            JSON.parse(dbResponse.itemData) ?? {},
            dbResponse.itemID,
            dbResponse.value
        );
    }

    constructor(
        itemName: string,
        itemType: string,
        itemData: IItemData,
        itemID?: number,
        value?: number
    ) {
        // itemID and value may be undefined - itemID in cases of newly generated items, value in case of retrieved items.
        this.itemID = itemID;
        this.value = value;
        this.itemName = itemName;
        this.itemType = itemType as ItemType;
        // load item-type specific data
        switch (itemType) {
            case "role":
                this.itemData = new ItemData(itemData.roleID);
                break;
            default:
                this.itemData = new ItemData(undefined, itemData.other);
        }
    }

    async addToShop() {
        if (this.value === undefined)
            throw new ItemError(
                "Can't create an item in the database without a value."
            );
        await DataStorage.createShopItem(
            this.itemName,
            this.itemType,
            this.itemData,
            this.value
        ).catch((e) => {
            // TODO add error handling if database error occurs
        });
    }
}
