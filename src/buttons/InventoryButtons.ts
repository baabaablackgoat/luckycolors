import { Item } from "../def/Item.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export type ButtonAction = ItemButtonAction | "page";
type ItemButtonAction = "unlock" | "equip" | "remove";
export function ItemButtonBuilder(
    item: Item,
    buttonAction: ItemButtonAction
): ButtonBuilder {
    if (!item.itemID) {
        throw new TypeError(
            "Passed item does not contain an item ID. Item IDs are necessary for creating buttons."
        );
    }
    let buttonStyle: ButtonStyle;
    switch (buttonAction) {
        case "unlock":
            buttonStyle = ButtonStyle.Primary;
            break;
        case "equip":
            buttonStyle = ButtonStyle.Success;
            break;
        case "remove":
            buttonStyle = ButtonStyle.Danger;
            break;
    }
    return new ButtonBuilder()
        .setCustomId(`${buttonAction}_${item.itemID}`)
        .setLabel(item.itemName)
        .setStyle(buttonStyle);
}

export function buttonPageBuilder(
    type: ButtonAction,
    currentPage: number,
    itemCount: number,
    itemsPerPage = 20
): ActionRowBuilder | null {
    if (currentPage < 0)
        throw new RangeError(
            `Supplied page number ${currentPage} out of bounds, how the hell did that happen?`
        );
    if (itemCount < 0)
        throw new RangeError(`Supplied itemCount ${itemCount} out of bounds.`);
    if (itemsPerPage <= 0 || itemsPerPage > 20)
        throw new RangeError(
            `Supplied itemsPerPage ${itemsPerPage} out of bounds.`
        );
    const currentFirstItem = currentPage * itemsPerPage;
    const lastPage = Math.ceil(itemCount / itemsPerPage) - 1;
    const showBack = currentFirstItem > 0;
    const showFwd = currentPage < lastPage;
    if (showBack || showFwd) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Prev")
                .setCustomId(`page_${type}_${currentPage - 1}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!showBack),
            new ButtonBuilder()
                .setLabel("Next")
                .setCustomId(`page_${type}_${currentPage + 1}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!showFwd)
        );
    } else return null;
}

export function OwnedItemBuilder(
    items: Item[],
    page = 0,
    itemsPerPage = 20
): ActionRowBuilder[] {
    // value assertions
    if (itemsPerPage > 20 || itemsPerPage <= 0)
        throw new RangeError(
            `Invalid itemsPerPage param passed: ${itemsPerPage}, should be 1 <= n <= 20`
        );
    if (page < 0)
        throw new RangeError(`Tried to access a negative page index ${page}`);
    const firstItemIndex = itemsPerPage * page;
    const itemsToShow = items.slice(
        firstItemIndex,
        firstItemIndex + itemsPerPage
    );
    if (itemsToShow.length === 0) {
        throw new RangeError(
            "No items to display... a non-existent item page was accessed."
        );
    }
    let actionRowBuilders: ActionRowBuilder[] = [];
    // slice items into groups of 5
    const buttonRows = [
        itemsToShow.slice(0, 5),
        itemsToShow.slice(5, 10),
        itemsToShow.slice(10, 15),
        itemsToShow.slice(15, 20),
    ];
    // add a row for every 5 items (or less)
    buttonRows.every((row) => {
        if (row.length === 0) return false; // abort making new rows
        let rowBuilder = new ActionRowBuilder();
        row.every((item) => {
            rowBuilder.addComponents(ItemButtonBuilder(item, "equip"));
        });
        actionRowBuilders.push(rowBuilder);
    });
    // add the prev/next buttons
    const navRow = buttonPageBuilder("equip", page, items.length, itemsPerPage);
    if (navRow) actionRowBuilders.push(navRow);
    // return the result
    return actionRowBuilders;
}
