import { assertAdminPermissions, Command } from "../def/Command";
import { DataStorage } from "../def/DatabaseWrapper";
import { replyWithEmbed } from "../def/replyWithEmbed";
import { isAlphanumericString } from "../def/validationHelpers";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Role,
} from "discord.js";
import { Lang } from "../lang/LanguageProvider";
import { findItem } from "../def/FindItem.ts";

export const addRoleItem = new Command(
    Lang("command_addRole_name"),
    Lang("command_addRole_description"),
    async (interaction) => {
        const itemName = interaction.options
            .getString(Lang("command_addRole_argItemName"))
            .trim();
        const role = interaction.options.getRole(
            Lang("command_addRole_argRole")
        );
        const cost = interaction.options.getNumber(
            Lang("command_addRole_argCost")
        );
        const hidden = interaction.options.getBoolean("hidden") ?? false;
        await interaction.deferReply({ ephemeral: true });
        if (!(await assertAdminPermissions(interaction))) return;
        if (cost < 0) {
            await replyWithEmbed(
                interaction,
                Lang("addItem_error_invalidCostTitle"),
                Lang("addItem_error_invalidCostDescription"),
                "warn",
                undefined,
                true
            );
            return;
        }
        if (
            !itemName ||
            itemName.length === 0 ||
            !isAlphanumericString(itemName) ||
            itemName.length > 32
        ) {
            await replyWithEmbed(
                interaction,
                Lang("addItem_error_invalidNameTitle"),
                Lang("addItem_error_invalidNameDescription"),
                "warn",
                undefined,
                true
            );
            return;
        }
        if (!(role instanceof Role)) {
            await replyWithEmbed(
                interaction,
                Lang("addItem_error_unexpectedResponseTitle"),
                Lang("addRole_error_passedRoleObjectInvalid"),
                "error",
                undefined,
                true
            );
            return;
        }
        if (
            interaction.guild.members.me.roles.highest.comparePositionTo(
                role
            ) <= 0
        ) {
            // Bot role is lower than the role that will be assigned - we know that we can't safely give this role out
            await replyWithEmbed(
                interaction,
                Lang("addRole_error_roleTooStrongTitle"),
                Lang("addRole_error_roleTooStrongDescription"),
                "warn",
                undefined,
                true
            );
            return;
        }

        DataStorage.createShopItem(
            itemName,
            "role",
            { roleID: role.id },
            cost,
            hidden
        )
            .then(async () => {
                await replyWithEmbed(
                    interaction,
                    Lang("addRole_created_title"),
                    Lang("addRole_created_description", {
                        roleName: role.name,
                    }),
                    "info"
                );
            })
            .catch(async (e) => {
                console.error(`Item creation failed: ${e}`);
                await replyWithEmbed(
                    interaction,
                    Lang("addRole_error_unknownTitle"),
                    Lang("addRole_error_unknownDescription"),
                    "error"
                );
            });
    },
    [
        {
            type: "String",
            name: Lang("command_addRole_argItemName"),
            description: Lang("command_addRole_argItemNameDescription"),
            required: true,
        },
        {
            type: "Role",
            name: Lang("command_addRole_argRole"),
            description: Lang("command_addRole_argRoleDescription"),
            required: true,
        },
        {
            type: "Number",
            name: Lang("command_addRole_argCost"),
            description: Lang("command_addRole_argCostDescription"),
            required: true,
        },
        {
            type: "Boolean",
            name: "hidden",
            description:
                "Whether this item is HIDDEN from shops. Set to true to hide.",
            required: false,
        },
    ]
);

// TODO: change all of the below things to language keys
export const unlistItem = new Command(
    "unlist",
    "🛠️ Unlists an item from the shop",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const query = interaction.options.getString("itemname");
        const foundItem = await findItem(interaction, query);
        if (foundItem === null) return;
        if (foundItem.hidden) {
            void replyWithEmbed(
                interaction,
                "Already hidden",
                `The found item ${foundItem.itemName} is already marked as hidden. Nothing has changed.`,
                "warn",
                interaction.user,
                true
            );
            return;
        }
        await DataStorage.setShopItemVisibility(foundItem.itemID, true);
        void replyWithEmbed(
            interaction,
            "Item unlisted",
            `Item ${foundItem.itemName} is now hidden from stores.`,
            "info",
            interaction.user,
            true
        );
    },
    [
        {
            type: "String",
            name: "itemname",
            description: "The item to unlist.",
            required: true,
        },
    ]
);

// TODO: change all of the below things to language keys
export const relistItem = new Command(
    "relist",
    "🛠️ Lists a currently unlisted item from the shop.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const query = interaction.options.getString("itemname");
        const foundItem = await findItem(interaction, query);
        if (foundItem === null) return;
        if (!foundItem.hidden) {
            void replyWithEmbed(
                interaction,
                "Already visible",
                `The found item ${foundItem.itemName} is already accessible. Nothing has changed.`,
                "warn",
                interaction.user,
                true
            );
            return;
        }
        await DataStorage.setShopItemVisibility(foundItem.itemID, false);
        void replyWithEmbed(
            interaction,
            "Item relisted",
            `Item ${foundItem.itemName} is now available from stores.`,
            "info",
            interaction.user,
            true
        );
    },
    [
        {
            type: "String",
            name: "itemname",
            description: "The item to return to the store.",
            required: true,
        },
    ]
);

// TODO: change all of the below things to language keys
export const showUnlisted = new Command(
    "showunlisted",
    "🛠️ Shows all currently unlisted items.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        // TODO Implement
    }
);

// TODO: change all of the below things to language keys
export const changePrice = new Command(
    "changeprice",
    "🛠️ Alters the price for a shop item.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const query = interaction.options.getString("itemname");
        const newValue = interaction.options.getNumber("newvalue");
        if (isNaN(newValue) || newValue < 0) {
            void replyWithEmbed(
                interaction,
                "Invalid new value",
                `You've provided an invalid item value: ${newValue}`,
                "warn",
                interaction.user,
                true
            );
            return;
        }
        const foundItem = await findItem(interaction, query);
        if (foundItem === null) return;
        await DataStorage.setShopItemPrice(foundItem.itemID, newValue);
        void replyWithEmbed(
            interaction,
            "Value updated",
            `New value of ${foundItem.itemName}: ${foundItem.value} -> ${newValue}`,
            "warn",
            interaction.user,
            true
        );
    },
    [
        {
            type: "String",
            name: "itemname",
            description: "The item that will have its price altered.",
            required: true,
        },
        {
            type: "Number",
            name: "newvalue",
            description: "The new price for the item.",
            required: true,
        },
    ]
);

// TODO: change all of the below things to language keys
export const removeItem = new Command(
    "removeitem",
    "🛠️ Lists a currently unlisted item from the shop.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const query = interaction.options.getString("itemname");
        const foundItem = await findItem(interaction, query);
        if (foundItem === null) return;
        const ownerSnowflakes = await DataStorage.findAllOwners(
            foundItem.itemID
        );
        const confirmActionRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel("Yes, remove forever.")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`admin_removeItem_${foundItem.itemID}`),
                new ButtonBuilder()
                    .setLabel("No, go back!")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`admin_removeItem_cancel`)
            );
        await replyWithEmbed(
            interaction,
            `Removing item ${foundItem.itemName}`,
            `# WARNING!
            You are about to remove the item ${
                foundItem.itemName
            } from all databases.
            ## This process is irreversible.
            If you want to simply restrict users to gain access to this item, use /unlistitem instead.
            **${
                ownerSnowflakes.length
            } users will forever lose access to this item.**
            ${
                foundItem.itemType == "role" &&
                "Note that the associated role will not automatically be unassigned from users."
            }
            Do you wish to continue?`,
            "error",
            undefined,
            true,
            [confirmActionRow]
        );
    },
    [
        {
            type: "String",
            name: "itemname",
            description: "The item to permanently remove from the store.",
            required: true,
        },
    ]
);

export async function removeItemButtonHandler(
    interaction: ButtonInteraction,
    itemIDString: string
) {
    if (itemIDString === "cancel") {
        const deletionCancelled = new EmbedBuilder()
            .setTitle("Deletion cancelled")
            .setDescription(`No changes were made.`)
            .setColor(0xff0000);
        void interaction.update({
            embeds: [deletionCancelled],
            components: [],
        });
        return;
    }
    const itemID = parseInt(itemIDString);
    const deletedItem = await DataStorage.getShopItem(itemID);
    if (!deletedItem) {
        const itemMissingEmbed = new EmbedBuilder()
            .setTitle("Something went wrong...")
            .setDescription(
                `The item with the given itemID ${itemID} could not be found despite triggering a deletion confirmation. This is a bug!`
            )
            .setColor(0xff0000);
        void interaction.update({ embeds: [itemMissingEmbed], components: [] });
        return;
    }
    await DataStorage.removeShopItem(itemID);
    const itemRemovedEmbed = new EmbedBuilder()
        .setTitle("Item deleted.")
        .setDescription(
            `${deletedItem.itemName} (ID: ${deletedItem.itemID}) has been permanently removed.`
        );
    void interaction.update({ embeds: [itemRemovedEmbed], components: [] });
}
