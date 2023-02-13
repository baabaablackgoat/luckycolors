import { assertAdminPermissions, Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { isAlphanumericString } from "../def/validationHelpers.js";
import { Role } from "discord.js";

export const addRoleItem = new Command(
    "addrole",
    "🔧 Adds a Discord role as a shop item.",
    async (interaction) => {
        const itemName = interaction.options.getString("name").trim();
        const role = interaction.options.getRole("role");
        const cost = interaction.options.getNumber("cost");
        await interaction.deferReply({ ephemeral: true });
        if (!await assertAdminPermissions(interaction)) return;
        if (cost < 0) {
            await replyWithEmbed(
                interaction,
                "Invalid cost",
                "The cost of an item must be 0 or greater. (Yes, you can set freebies!)",
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
                "Invalid item name",
                "Item names can only be alphanumeric and must not be empty or longer than 32 characters.",
                "warn",
                undefined,
                true
            );
            return;
        }
        if (!(role instanceof Role)) {
            await replyWithEmbed(
                interaction,
                "Unexpected response received",
                "The role you specified behaved in a weird way... feel free to try again or go yell at me.",
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
                "Role too powerful!",
                "This role has a higher position than my highest role. I won't be able to hand out this role.",
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
                    "Item created!",
                    `Item with associated role ${role.name} created.`,
                    "info"
                );
            })
            .catch(async (e) => {
                console.error(`Item creation failed: ${e}`);
                await replyWithEmbed(
                    interaction,
                    "Something went horribly wrong...",
                    "I couldn't create this item in my database. Go yell at my creator.",
                    "error"
                );
            });
    },
    [
        {
            type: "String",
            name: "name",
            description: "🔧 The name this item should have.",
            required: true,
        },
        {
            type: "Role",
            name: "role",
            description: "🔧 The user to target.",
            required: true,
        },
        {
            type: "Number",
            name: "cost",
            description: "🔧 How many 🪙 it will cost to unlock this item.",
            required: true,
        },
    ]
);
