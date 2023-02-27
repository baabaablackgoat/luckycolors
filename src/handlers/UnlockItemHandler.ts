import { findItem } from "../def/FindItem.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";

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
            "Already owned",
            `You already own the item ${foundItem.itemName}.`,
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
            "Not enough funds!",
            `You cannot afford ${foundItem.itemName}! It costs ${foundItem.value} 🪙, but you only have ${userBalance} 🪙.`,
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
            "Item unlocked!",
            `You have unlocked the item ${foundItem.itemName} for ${foundItem.value} 🪙!\n
                    ~~${userBalance}~~ -> **${newUserBalance}** 🪙`,
            "info",
            interaction.user
        );
    } catch (e) {
        await replyWithEmbed(
            interaction,
            "Something went horribly wrong...",
            "Something went wrong while trying to give you this item. Feel free to yell at my creator.",
            "error",
            interaction.user,
            true
        );
        console.error(`Failed to give the user an item: ${e}`);
    }
}
