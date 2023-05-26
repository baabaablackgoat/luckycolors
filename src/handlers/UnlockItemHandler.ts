import { findItem } from "../def/FindItem.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { Lang } from "../lang/LanguageProvider";

export async function unlockItemHandler(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    itemQuery: string
) {
    const foundItem = await findItem(interaction, itemQuery);
    if (foundItem === null) return;
    if (
        await DataStorage.checkItemOwnership(
            interaction.user.id,
            foundItem.itemID
        )
    ) {
        await replyWithEmbed(
            interaction,
            Lang("unlockItem_error_alreadyOwnedTitle"),
            Lang("unlockItem_error_alreadyOwnedDescription", {
                item: foundItem.itemName,
            }),
            "info",
            interaction.user,
            true
        );
        return;
    }
    const userBalance = await DataStorage.getUserBalance(interaction.user.id);
    if (userBalance < foundItem.value) {
        await replyWithEmbed(
            interaction,
            Lang("unlockItem_error_insufficientBalanceTitle"),
            Lang("unlockItem_error_insufficientBalanceDescription", {
                item: foundItem.itemName,
                value: foundItem.value,
                balance: userBalance,
            }),
            "warn",
            interaction.user,
            true
        );
        return;
    }
    try {
        const newUserBalance = await DataStorage.subtractUserBalance(
            interaction.user.id,
            foundItem.value
        );
        await DataStorage.giveUserItem(interaction.user.id, foundItem.itemID);
        await replyWithEmbed(
            interaction,
            Lang("unlockItem_reply_unlockedTitle"),
            Lang("unlockItem_reply_unlockedDescription", {
                item: foundItem.itemName,
                value: foundItem.value,
                oldBalance: userBalance,
                newBalance: newUserBalance,
            }),
            "info",
            interaction.user
        );
    } catch (e) {
        await replyWithEmbed(
            interaction,
            Lang("unlockItem_error_unknownErrorTitle"),
            Lang("unlockItem_error_unknownErrorDescription"),
            "error",
            interaction.user,
            true
        );
        console.error(`Failed to give the user an item: ${e}`);
    }
}
