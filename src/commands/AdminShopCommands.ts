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
