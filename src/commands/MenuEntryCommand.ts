import { Command } from "../def/Command.js";
import { Lang } from "../lang/LanguageProvider.js";
import { mainMenuButtonRow, mainMenuEmbed } from "../menu/Menu.js";

export const enter = new Command(
    Lang("command_enter_name"),
    Lang("command_enter_description"),
    async (interaction) => {
        void interaction.reply({
            embeds: [mainMenuEmbed],
            //@ts-ignore: fuck off
            components: [mainMenuButtonRow],
            ephemeral: true,
        });
    }
);
