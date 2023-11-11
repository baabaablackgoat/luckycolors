import { Command } from "../def/Command";
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";

export const Monopoly = new Command(
    "monopoly",
    "Test your awful monopoly luck!",
    async (interaction) => {
        void monopolyExecute(interaction);
    }
);

type MonopolyEffect = {
    effect: (
        interaction: ChatInputCommandInteraction | ButtonInteraction
    ) => void;
    weight: number;
};

function timeOutMember(
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    (interaction.member as GuildMember)
        .timeout(5e7, "Drew the wrong monopoly card")
        .then()
        .catch((e) => {});
}

export const monopolyExecute = async (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
    const effects: MonopolyEffect[] = [];
};
