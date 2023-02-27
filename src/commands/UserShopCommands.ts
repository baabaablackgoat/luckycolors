import { Command } from "../def/Command.js";
import { DatabaseWrapper, DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { OwnedItemBuilder } from "../buttons/InventoryButtons.js";
import { useItemHandler } from "../handlers/UseItemHandler.js";
import { unlockItemHandler } from "../handlers/UnlockItemHandler.js";

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

export const listOwnedItems = new Command(
    "inventory",
    "Lists all your owned items, and allows for easy equipping.",
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
        await replyWithEmbed(
            interaction,
            "This is your inventory.",
            "Click the buttons below to equip or unequip / use your items.",
            "info",
            interaction.user,
            true,
            OwnedItemBuilder(ownedItems)
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
        const missingItems =
            await DatabaseWrapper.getInstance().listUnownedItems(
                interaction.user.id
            );
        if (missingItems.length === 0)
            void replyWithEmbed(
                interaction,
                "No unowned items!",
                "You seem to have every item currently available!",
                "warn",
                interaction.user
            );
        else {
            void replyWithEmbed(
                interaction,
                "Unowned items",
                missingItems.map((item) => item.itemName).join(", "),
                "info",
                interaction.user
            );
            // TODO: add cool paginated buttons
        }
    }
);
