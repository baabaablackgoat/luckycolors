import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { Item } from "./Item.js";
import { isAlphanumericString } from "./validationHelpers.js";
import { replyWithEmbed } from "./replyWithEmbed.js";
import { DataStorage } from "./DatabaseWrapper.js";
import { Lang } from "../lang/LanguageProvider";

/**
 * Helper function that resolves an item name or ID to a database item. Also does some query sanitization.
 * @param interaction The interaction to possibly reject.
 * @param query: The user query. Separated from interaction to allow for different option names.
 * @private
 */
export async function findItem(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    query: string
): Promise<Item | null> {
    // trim whitespace
    const itemRequest = query.trim();
    if (itemRequest.length === 0 || !isAlphanumericString(itemRequest)) {
        await replyWithEmbed(
            interaction,
            Lang("findItem_error_invalidInputTitle"),
            Lang("findItem_error_invalidInputDescription"),
            "warn",
            interaction.user,
            true
        );
        return null;
    }
    let foundItem = await DataStorage.searchShopItem(itemRequest);
    // attempt to retrieve the item by the ID
    if (!foundItem && !isNaN(parseInt(itemRequest)))
        foundItem = await DataStorage.getShopItem(parseInt(itemRequest));
    // if it could still not be found, blame the user :^)
    if (!foundItem) {
        await replyWithEmbed(
            interaction,
            Lang("findItem_error_notFoundTitle"),
            Lang("findItem_error_notFoundDescription", { query: itemRequest }),
            "warn",
            interaction.user,
            true
        );
        return null;
    }
    return foundItem;
}
