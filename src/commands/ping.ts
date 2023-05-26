import { Command } from "../def/Command.js";
import { Lang } from "../lang/LanguageProvider";

export const ping = new Command(
    Lang("command_ping_name"),
    Lang("command_ping_description"),
    async (interaction) => {
        await interaction.reply(Lang("ping_reply_text"));
    }
);
