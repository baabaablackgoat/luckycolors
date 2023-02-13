import { assertAdminPermissions, Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";

export const balance = new Command(
    "balance",
    "Checks your balance (🔧 or another user's balance)",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const targetedUser =
            interaction.options.getUser("target") ?? interaction.user;
        if (interaction.user.id != targetedUser.id) {
            if (!(await assertAdminPermissions(interaction))) return;
        }
        const userBal = await DataStorage.getUserBalance(targetedUser.id);
        await replyWithEmbed(
            interaction,
            "Balance",
            `**${userBal}** 🪙`,
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: "target",
            description: "🔧 Check the specified users balance.",
        },
    ]
);

export const setBalance = new Command(
    "setbalance",
    "🔧 Set any users balance",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser("target");
        const newAmount = interaction.options.getNumber("amount");
        if (newAmount < 0) {
            await replyWithEmbed(
                interaction,
                "Invalid amount",
                "The new amount must be a number greater or equal to 0.",
                "warn"
            );
            return;
        }
        // TODO: better error handling
        const setBalance = await DataStorage.setUserBalance(
            targetedUser.id,
            newAmount
        ).catch(console.error);
        await replyWithEmbed(
            interaction,
            "Updated balance",
            `New balance: ${setBalance} 🪙`,
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: "target",
            description: "🔧 The user to target.",
            required: true,
        },
        {
            type: "Number",
            name: "amount",
            description: "🔧 The new balance to set.",
            required: true,
        },
    ]
);

export const addBalance = new Command(
    "addbalance",
    "🔧 Adds balance to the targeted user.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser("target");
        const toAdd = interaction.options.getNumber("amount");
        if (toAdd < 0) {
            await replyWithEmbed(
                interaction,
                "Invalid amount",
                "The new amount must be a number greater or equal to 0. Use subtractbalance or setbalance to achieve balance reduction.",
                "warn"
            );
            return;
        }
        const newBalance = await DataStorage.addUserBalance(targetedUser.id, toAdd);
        await replyWithEmbed(
            interaction,
            `${toAdd} 🪙 added`,
            `~~${newBalance - toAdd}~~ -> **${newBalance}** 🪙`,
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: "target",
            description: "🔧 The user to target.",
            required: true,
        },
        {
            type: "Number",
            name: "amount",
            description: "🔧 The amount of currency to add.",
            required: true,
        },
    ]
);

export const subtractBalance = new Command(
    "subtractbalance",
    "🔧 Subtracts some currency from the targeted user.",
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser("target");
        const toSubtract = interaction.options.getNumber("amount");
        if (toSubtract < 0) {
            await replyWithEmbed(
                interaction,
                "Invalid amount",
                "The new amount must be a number greater or equal to 0. Use addbalance or setbalance to give out currency.",
                "warn"
            );
            return;
        }
        const oldUserBalance = await DataStorage.getUserBalance(targetedUser.id);
        if (oldUserBalance - toSubtract < 0) {
            await replyWithEmbed(
                interaction,
                "Balance insufficient",
                `The targeted user only has ${oldUserBalance}, and you tried to deduct ${toSubtract}. We don't do overdrafts here.`,
                "warn",
                targetedUser
            );
            return;
        }
        const newBalance = await DataStorage.subtractUserBalance(targetedUser.id, toSubtract);
        await replyWithEmbed(
            interaction,
            `${toSubtract} 🪙 deducted`,
            `~~${oldUserBalance}~~ -> **${newBalance}** 🪙`,
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: "target",
            description: "🔧 The user to target.",
            required: true,
        },
        {
            type: "Number",
            name: "amount",
            description: "🔧 The amount of currency to subtract.",
            required: true,
        },
    ]
);
