import { Command } from "../def/Command.js";
import { DeckStorage } from "../def/Deck.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const drawCard = new Command(
    "card",
    "Draw a random card from a virtually shuffled deck.",
    async (interaction) => {
        const decks = DeckStorage.getInstance();
        const deck = decks.createDeck(interaction.id);
        void replyWithEmbed(
            interaction,
            "You've drawn...",
            `${deck.drawCard().toString()}\nCards left: ${deck.cardCount}`,
            "info",
            interaction.user,
            true,
            [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Draw again?")
                        .setCustomId(`drawCard_${interaction.id}`)
                        .setStyle(ButtonStyle.Primary)
                ),
            ]
        );
    }
);
