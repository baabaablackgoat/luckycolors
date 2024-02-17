import { assertAdminPermissions, Command } from "../def/Command";
import { DataStorage } from "../def/DatabaseWrapper";
import { replyWithEmbed } from "../def/replyWithEmbed";
import { isAlphanumericString } from "../def/validationHelpers";
import { Role } from "discord.js";
import { Lang } from "../lang/LanguageProvider";

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

        DataStorage.createShopItem(itemName, "role", { roleID: role.id }, cost)
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
    ]
);

// TODO: change all of the below things to language keys
export const unlistItem = new Command(
    "unlist",
    "🛠️ Unlists an item from the shop",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        // TODO Implement
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
        // TODO Implement
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
    "changePrice",
    "🛠️ Alters the price for a shop item.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        // TODO Implement
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
            name: "newValue",
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
        // TODO Implement
        // TODO: Ensure that the admin absolutely wants to remove this item (which should cause a cascade delete in inventories!)
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
