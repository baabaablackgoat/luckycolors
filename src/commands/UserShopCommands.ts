import { Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { isAlphanumericString } from "../def/validationHelpers.js";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Item } from "../def/Item";

/**
 * Helper function that resolves an item name or ID to a database item. Also does some query sanitization.
 * @param interaction The interaction to possibly reject.
 * @param query: The user query. Separated from interaction to allow for different option names.
 * @private
 */
async function findItem(
    interaction: ChatInputCommandInteraction,
    query: string
): Promise<Item | null> {
    // trim whitespace
    const itemRequest = query.trim();
    if (itemRequest.length === 0 || !isAlphanumericString(itemRequest)) {
        await replyWithEmbed(
            interaction,
            "Invalid item descriptor",
            "This is not a valid item id nor a valid name!",
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
            "Unknown item",
            `Your query ${itemRequest} couldn't be resolved into any known items.`,
            "warn",
            interaction.user,
            true
        );
        return null;
    }
    return foundItem;
}

export const buyItem = new Command(
    "buyitem",
    "Unlocks the item with the given name in exchange for your 🪙.",
    async (interaction) => {
        const foundItem = await findItem(
            interaction,
            interaction.options.getString("item")
        );
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
        await interaction.deferReply({ ephemeral: true });
        const foundItem = await findItem(
            interaction,
            interaction.options.getString("item")
        );
        if (foundItem === null) return;
        if (
            !(await DataStorage.checkItemOwnership(
                interaction.user.id,
                foundItem.itemID
            ))
        ) {
            await replyWithEmbed(
                interaction,
                "Not unlocked",
                `You do not own the item ${foundItem.itemName}.`,
                "warn",
                interaction.user,
                true
            );
            return;
        }
        if (foundItem.itemType === "role") {
            const foundRole = await interaction.guild.roles
                .fetch(foundItem.itemData.roleID)
                .catch(async (err) => {
                    console.error(
                        `Couldn't fetch role with id ${foundItem.itemData.roleID}`,
                        err
                    );
                });
            if (!foundRole) {
                await replyWithEmbed(
                    interaction,
                    "Something went wrong...",
                    "I couldn't retrieve the role associated with this item. Was it deleted?",
                    "error",
                    interaction.user,
                    true
                );
                return;
            }
            if (!(interaction.member instanceof GuildMember)) {
                await replyWithEmbed(
                    interaction,
                    "Something went wrong...",
                    "Discord answered with a weird API object that I don't wanna deal with. Sorry :P",
                    "error",
                    interaction.user,
                    true
                );
                return;
            }
            if (interaction.member.roles.cache.has(foundRole.id)) {
                // Member has role - remove it
                interaction.member.roles
                    .remove(foundRole)
                    .then(async () => {
                        await replyWithEmbed(
                            interaction,
                            "Role removed",
                            `I've removed your unlocked role ${foundRole.name}.`,
                            "info",
                            interaction.user,
                            true
                        );
                    })
                    .catch(async (err) => {
                        console.error("Failed to remove role from member", err);
                        await replyWithEmbed(
                            interaction,
                            "Couldn't remove role.",
                            "I couldn't remove the role from you. I might not have the permissions to do so.",
                            "error",
                            interaction.user,
                            true
                        );
                    });
                return;
            } else {
                // Member does not have role - add
                interaction.member.roles
                    .add(foundRole)
                    .then(async () => {
                        await replyWithEmbed(
                            interaction,
                            "Role added",
                            `I've assigned you your unlocked role ${foundRole.name}.`,
                            "info",
                            interaction.user,
                            true
                        );
                    })
                    .catch(async (err) => {
                        console.error("Failed to assign role to member", err);
                        await replyWithEmbed(
                            interaction,
                            "Couldn't assign role.",
                            "I couldn't assign the role to you. I might not have the permissions to do so.",
                            "error",
                            interaction.user,
                            true
                        );
                    });
                return;
            }
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
