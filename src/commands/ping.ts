import { Command } from "../def/Command.js";

export const ping = new Command("ping", "Pong!",
    async (interaction) => {
        await interaction.reply('deez nuts. HA, GOTEM')
    });