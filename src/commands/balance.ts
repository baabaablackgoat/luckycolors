import { Command } from "../def/Command.js";
import { DataStorage } from "../def/DatabaseWrapper.js";

export const balance = new Command(
    "balance",
    "Checks your balance (or another user's balance if you're an admin)",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const targetedUser =
            interaction.options.getUser("target") ?? interaction.user;
        if (interaction.user.id != targetedUser.id) {
            // TODO: Admin check here
        }
        const userBal = await DataStorage.checkUserBalance(targetedUser.id);
        await interaction.editReply(`Balance: ${userBal}`);
    },
    [
        {
            type: "User",
            name: "target",
            description: "🔧 Check the specified users balance.",
        },
    ]
);
