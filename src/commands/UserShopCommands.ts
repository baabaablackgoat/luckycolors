import { Command } from "../def/Command.js";
import { DatabaseWrapper, DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { MessageItemDisplayBuilder } from "../buttons/InventoryButtons.js";
import { useItemHandler } from "../handlers/UseItemHandler.js";
import { unlockItemHandler } from "../handlers/UnlockItemHandler.js";
import { Item } from "../def/Item";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";

export const buyItem = new Command(
    "buyitem",
    "Unlocks the item with the given name in exchange for your 🪙.",
    async (interaction) => {
        void unlockItemHandler(
            interaction,
            interaction.options.getString("item")
        );
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

/**
 * Retrieves the list of owned items, or responds to the interaction if they own none.
 */
export async function retrieveOwnedItems(
    interaction: ChatInputCommandInteraction | ButtonInteraction
): Promise<Item[] | null> {
    const ownedItems = await DataStorage.listOwnedItems(interaction.user.id);
    if (ownedItems.length === 0) {
        await replyWithEmbed(
            interaction,
            "No items found!",
            "It seems like you don't own any items... sadge.",
            "info",
            interaction.user,
            true
        );
        return null;
    } else return ownedItems;
}

export async function retrieveUnownedItems(
    interaction: ChatInputCommandInteraction | ButtonInteraction
): Promise<Item[] | null> {
    const unownedItems = await DataStorage.listUnownedItems(
        interaction.user.id
    );
    if (unownedItems.length === 0) {
        void replyWithEmbed(
            interaction,
            "No unowned items!",
            "You seem to have every item currently available!",
            "warn",
            interaction.user
        );
        return null;
    } else return unownedItems;
}

export const listOwnedItems = new Command(
    "inventory",
    "Lists all your owned items, and allows for easy equipping.",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const ownedItems = await retrieveOwnedItems(interaction);
        if (ownedItems === null) return;
        await replyWithEmbed(
            interaction,
            "This is your inventory.",
            "Click the buttons below to equip or unequip / use your items.",
            "info",
            interaction.user,
            true,
            MessageItemDisplayBuilder(ownedItems, "equip")
        );
    }
);

export const useItem = new Command(
    "useitem",
    "Performs the use action on an item - if you own it! (e.g. equipping a role)",
    async (interaction) => {
        void useItemHandler(interaction, interaction.options.getString("item"));
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

export const listItems = new Command(
    "listall",
    "Lists all items that are registered.",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const allItems = await DatabaseWrapper.getInstance().listAllShopItems();
        void replyWithEmbed(
            interaction,
            "All available items",
            allItems.map((item) => item.itemName).join(", "),
            "info"
        );
    },
    [
        {
            type: "Number",
            name: "page",
            description: "The page number to show",
            required: false,
        },
    ]
);

export const shop = new Command(
    "shop",
    "Lists all items that you haven't unlocked yet.",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const missingItems = await retrieveUnownedItems(interaction);
        if (!missingItems) return;
        else {
            void replyWithEmbed(
                interaction,
                "The Shop",
                `Purchase any missing items here!`,
                "info",
                interaction.user,
                true,
                MessageItemDisplayBuilder(missingItems, "unlock")
            );
        }
    }
);
