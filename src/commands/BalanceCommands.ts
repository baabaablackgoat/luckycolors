import { assertAdminPermissions, Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { Lang } from "../lang/LanguageProvider";

export const balance = new Command(
    Lang("command_checkBalance_name"),
    Lang("command_checkBalance_description"),
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const targetedUser =
            interaction.options.getUser(
                Lang("command_checkBalance_argTargetUser")
            ) ?? interaction.user;
        if (interaction.user.id != targetedUser.id) {
            if (!(await assertAdminPermissions(interaction))) return;
        }
        const userBal = await DataStorage.getUserBalance(targetedUser.id);
        await replyWithEmbed(
            interaction,
            Lang("checkBalance_reply_title"),
            Lang("checkBalance_reply_description", {
                userBal: userBal.toString(),
            }),
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: Lang("command_checkBalance_argTargetUser"),
            description: Lang("command_checkBalance_argTargetUserDescription"),
        },
    ]
);

export const setBalance = new Command(
    Lang("command_setBalance_name"),
    Lang("command_setBalance_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser(
            Lang("command_setBalance_argTargetUser")
        );
        const newAmount = interaction.options.getNumber(
            Lang("command_setBalance_argAmount")
        );
        if (newAmount < 0) {
            await replyWithEmbed(
                interaction,
                Lang("setBalance_error_invalidAmountTitle"),
                Lang("setBalance_error_invalidAmountDescription"),
                "warn"
            );
            return;
        }
        // TODO: better error handling
        const setBalance = await DataStorage.setUserBalance(
            targetedUser.id,
            newAmount
        ).catch(console.error);
        if (!setBalance) {
            // this is just a void guard, and honestly, should never happen.
            console.warn(
                "Something went wrong while setting the user balance, but no error was thrown."
            );
            return;
        }
        await replyWithEmbed(
            interaction,
            Lang("setBalance_reply_successTitle"),
            Lang("setBalance_reply_successDescription", {
                userBal: setBalance.toString(),
            }),
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: Lang("command_setBalance_argTargetUser"),
            description: Lang("command_setBalance_argTargetUserDescription"),
            required: true,
        },
        {
            type: "Number",
            name: Lang("command_setBalance_argAmount"),
            description: Lang("command_setBalance_argAmountDescription"),
            required: true,
        },
    ]
);

export const addBalance = new Command(
    Lang("command_addBalance_name"),
    Lang("command_addBalance_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser(
            Lang("command_addBalance_argTargetUser")
        );
        const toAdd = interaction.options.getNumber(
            Lang("command_addBalance_argAmount")
        );
        if (toAdd < 0) {
            await replyWithEmbed(
                interaction,
                Lang("addBalance_error_invalidAmountTitle"),
                Lang("addBalance_error_invalidAmountDescription"),
                "warn"
            );
            return;
        }
        const newBalance = await DataStorage.addUserBalance(
            targetedUser.id,
            toAdd
        );
        await replyWithEmbed(
            interaction,
            Lang("addBalance_reply_successTitle", {
                addedBalance: toAdd.toString(),
            }),
            Lang("addBalance_reply_successDescription", {
                oldBalance: (newBalance - toAdd).toString(),
                newBalance: newBalance.toString(),
            }),
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: Lang("command_addBalance_argTargetUser"),
            description: Lang("command_addBalance_argTargetUserDescription"),
            required: true,
        },
        {
            type: "Number",
            name: Lang("command_addBalance_argAmount"),
            description: Lang("command_addBalance_argAmountDescription"),
            required: true,
        },
    ]
);

export const subtractBalance = new Command(
    Lang("command_subtractBalance_name"),
    Lang("command_subtractBalance_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        const targetedUser = interaction.options.getUser(
            Lang("command_subtractBalance_argTargetUser")
        );
        const toSubtract = interaction.options.getNumber(
            Lang("command_subtractBalance_argAmount")
        );
        if (toSubtract < 0) {
            await replyWithEmbed(
                interaction,
                Lang("subtractBalance_error_invalidAmountTitle"),
                Lang("subtractBalance_error_invalidAmountDescription"),
                "warn"
            );
            return;
        }
        const oldUserBalance = await DataStorage.getUserBalance(
            targetedUser.id
        );
        if (oldUserBalance - toSubtract < 0) {
            await replyWithEmbed(
                interaction,
                Lang("subtractBalance_error_insufficientBalanceTitle"),
                Lang("subtractBalance_error_insufficientBalanceTitle", {
                    oldUserBalance: oldUserBalance.toString(),
                    toSubtract: toSubtract.toString(),
                }),
                "warn",
                targetedUser
            );
            return;
        }
        const newBalance = await DataStorage.subtractUserBalance(
            targetedUser.id,
            toSubtract
        );
        await replyWithEmbed(
            interaction,
            Lang("subtractBalance_reply_successTitle", {
                toSubtract: toSubtract.toString(),
            }),
            Lang("subtractBalance_reply_successDescription", {
                oldBalance: oldUserBalance.toString(),
                newBalance: newBalance.toString(),
            }),
            "info",
            targetedUser
        );
    },
    [
        {
            type: "User",
            name: Lang("command_subtractBalance_argTargetUser"),
            description: Lang(
                "command_subtractBalance_argTargetUserDescription"
            ),
            required: true,
        },
        {
            type: "Number",
            name: Lang("command_subtractBalance_argAmount"),
            description: Lang("command_subtractBalance_argAmountDescription"),
            required: true,
        },
    ]
);
