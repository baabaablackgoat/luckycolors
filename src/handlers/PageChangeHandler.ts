import { ButtonInteraction } from "discord.js";
import {
    ItemButtonAction,
    OwnedItemBuilder,
} from "../buttons/InventoryButtons.js";
import { retrieveOwnedItems } from "../commands/UserShopCommands.js";

export async function pageChangeHandler(interaction: ButtonInteraction) {
    const splitCustomID = interaction.customId.split("_");
    if (splitCustomID.length < 3) {
        throw new Error(
            `Interaction ID for page change was malformed: ${interaction.customId}`
        );
    }
    const pageType = splitCustomID[1] as ItemButtonAction;
    const targetPage = parseInt(splitCustomID[2]);
    switch (pageType) {
        case "equip":
            const ownedItems = await retrieveOwnedItems(interaction);
            if (ownedItems === null) return;

            void interaction.editReply({
                // @ts-ignore: type shenanigans
                components: OwnedItemBuilder(ownedItems, targetPage),
            });
            break;
        case "remove":
        case "unlock":
            void interaction.editReply(`Not yet implemented.`);
            break;
    }
}
