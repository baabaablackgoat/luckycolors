export type ItemType = "role" | "other";
export class ItemData {
    roleID?: string;
    other?: {};

    constructor(roleID?: string, other?: {}) {
        this.roleID = roleID;
        this.other = other;
    }

    toJSON(): string {
        const dataObject = {
            roleID: this.roleID,
            other: this.other,
        }
        return JSON.stringify(dataObject)
    }
}

// TODO: Create items based on db responses instead of manual specification
// maybe create an overload?
export class Item {
    itemID: number;
    itemName: string;
    itemType: ItemType;
    itemData: ItemData;
    value: number;

    constructor(
        itemID: number,
        itemName: string,
        itemType: string,
        itemData: string,
        value: number
    ) {
        this.itemID = itemID;
        this.itemName = itemName;
        this.itemType = itemType as ItemType;
        this.value = value;

        // load item-type specific data
        const dataObject = JSON.parse(itemData);
        switch (itemType) {
            case "role":
                this.itemData = new ItemData(dataObject.roleID);
                break;
            default:
                this.itemData = new ItemData(undefined, dataObject.other);
        }
    }
}
