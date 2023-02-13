import { Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { isAlphanumericString } from "../def/validationHelpers.js";

export const buyItem = new Command(
    "buyitem",
    "Unlocks the item with the given name in exchange for your 🪙.",
    async (interaction) => {
        const itemRequest = interaction.options.getString("item").trim();
        if (itemRequest.length === 0 || !isAlphanumericString(itemRequest)) {
            await replyWithEmbed(
                interaction,
                "Invalid item descriptor",
                "This is not a valid item id nor a valid name!",
                "warn",
                interaction.user,
                true
            );
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        let foundItem = await DataStorage.searchShopItem(itemRequest);
        // attempt to retrieve the item by the ID
        if (!foundItem && !isNaN(parseInt(itemRequest)))
            foundItem = await DataStorage.getShopItem(parseInt(itemRequest));
        // if it could still not be found, blame the user :^)
        if (!foundItem) {
            await replyWithEmbed(
                interaction,
                "Unknown item",
                `Your query ${itemRequest} couldn't be resolved into any known items.`,
                "warn",
                interaction.user,
                true
            );
            return;
        }
        // FIXME: the ownership check fails! aaaaa
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
        const userBalance = await DataStorage.getUserBalance(
            interaction.user.id
        );
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
            await DataStorage.giveUserItem(
                interaction.user.id,
                foundItem.itemID
            );
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
    },
    [
        {
            type: "String",
            name: "item",
            description: "The name or item ID",
            required: true,
        },
    ]
);

export const listOwnedItems = new Command(
    "owned",
    "Lists all owned items.",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const ownedItems = await DataStorage.listOwnedItems(
            interaction.user.id
        );
        if (ownedItems.length === 0) {
            await replyWithEmbed(
                interaction,
                "No items found!",
                "It seems like you don't own any items... sadge.",
                "info",
                interaction.user,
                true
            );
            return;
        }
        // todo: add clickable buttons to this message!
        await replyWithEmbed(
            interaction,
            "Owned items:",
            ownedItems
                .map((item) => {
                    return item.itemName;
                })
                .join(", "),
            "info",
            interaction.user
        );
    }
);

export const useItem = new Command(
    "useitem",
    "Performs the use action on an item - if you own it! (e.g. equipping a role)",
    async (interaction) => {
        // todo
    },
    [
        {
            type: "String",
            name: "item",
            description: "The name or item ID",
            required: true,
        },
    ]
);
