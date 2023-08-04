import { Command } from "../def/Command.js";
import { DatabaseWrapper, DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { MessageItemDisplayBuilder } from "../buttons/InventoryButtons.js";
import { useItemHandler } from "../handlers/UseItemHandler.js";
import { unlockItemHandler } from "../handlers/UnlockItemHandler.js";
import { Item } from "../def/Item";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { Lang } from "../lang/LanguageProvider";

export const buyItem = new Command(
    Lang("command_buyItem_name"),
    Lang("command_buyItem_description"),
    async (interaction) => {
        void unlockItemHandler(
            interaction,
            interaction.options.getString(Lang("command_buyItem_argItem"))
        );
    },
    [
        {
            type: "String",
            name: Lang("command_buyItem_argItem"),
            description: Lang("command_buyItem_argItemDescription"),
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
            Lang("ownedItems_error_noItemsOwnedTitle"),
            Lang("ownedItems_error_noItemsOwnedDescription"),
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
            Lang("unownedItems_error_allItemsOwnedTitle"),
            Lang("unownedItems_error_allItemsOwnedDescription"),
            "warn",
            interaction.user
        );
        return null;
    } else return unownedItems;
}

export const listOwnedItems = new Command(
    Lang("command_inventory_name"),
    Lang("command_inventory_description"),
    async (interaction) => {
        await listOwnedItemsExecute(interaction);
    }
);

export const listOwnedItemsExecute = async (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
    await interaction.deferReply({ ephemeral: true });
    const ownedItems = await retrieveOwnedItems(interaction);
    if (ownedItems === null) return;
    await replyWithEmbed(
        interaction,
        Lang("inventory_reply_title"),
        Lang("inventory_reply_description"),
        "info",
        interaction.user,
        true,
        MessageItemDisplayBuilder(ownedItems, "equip")
    );
};

export const useItem = new Command(
    Lang("command_useItem_name"),
    Lang("command_useItem_description"),
    async (interaction) => {
        void useItemHandler(
            interaction,
            interaction.options.getString(Lang("command_useItem_argItem"))
        );
    },
    [
        {
            type: "String",
            name: Lang("command_useItem_argItem"),
            description: Lang("command_useItem_argItemDescription"),
            required: true,
        },
    ]
);

export const listItems = new Command(
    Lang("command_listAll_name"),
    Lang("command_listAll_description"),
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const allItems = await DatabaseWrapper.getInstance().listAllShopItems();
        // const page = interaction.options.getNumber(Lang("command_listAll_argPage"));
        // TODO: there's currently a limit of 100 set in this request, and we have a page argument.
        //  This page argument is not implemented!
        void replyWithEmbed(
            interaction,
            Lang("listAll_reply_title"),
            allItems.map((item) => item.itemName).join(", "),
            "info"
        );
    },
    [
        {
            type: "Number",
            name: Lang("command_listAll_argPage"),
            description: Lang("command_listAll_argPageDescription"),
            required: false,
        },
    ]
);

export const shop = new Command(
    Lang("command_shop_name"),
    Lang("command_shop_description"),
    async (interaction) => {
        await shopExecute(interaction);
    }
);

export const shopExecute = async (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
    await interaction.deferReply({ ephemeral: true });
    const missingItems = await retrieveUnownedItems(interaction);
    if (!missingItems) return;
    else {
        void replyWithEmbed(
            interaction,
            Lang("shop_reply_title"),
            Lang("shop_reply_description"),
            "info",
            interaction.user,
            true,
            MessageItemDisplayBuilder(missingItems, "unlock")
        );
    }
};
