import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle} from "discord.js";
import { useItemHandler } from "../handlers/UseItemHandler.js";
import { unlockItemHandler } from "../handlers/UnlockItemHandler.js";
import { DeckStorage } from "./Deck.js";
import { replyWithEmbed } from "./replyWithEmbed.js";

function getItemID(customID: string): string {
    return customID.split("_")[1];
}

export class ButtonHandler {
    static async equip(interaction: ButtonInteraction) {
        void useItemHandler(interaction, getItemID(interaction.customId));
    }
    static async unlock(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        void unlockItemHandler(interaction, getItemID(interaction.customId));
    }
    static async remove(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const itemID = getItemID(interaction.customId);
        // TODO
        await interaction.editReply(
            `todo: revoke item ID ${itemID}, coming soon i swear`
        );
    }
    static async page(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        // TODO: pages need to be implemented still aaa
        await interaction.editReply(`coming soon I swear`);
    }
    static async drawCard(interaction: ButtonInteraction) {
        try {
            const deckID = interaction.customId.split("_")[1];
            const deck = DeckStorage.getInstance().getDeck(deckID);
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
                            .setCustomId(`drawCard_${deckID}`)
                            .setStyle(ButtonStyle.Primary)
                    ),
                ]
            );
        } catch (e) {
            void replyWithEmbed(
                interaction,
                "Something went wrong...",
                `I couldn't retrieve the deck I was drawing from before :(`,
                "error",
                interaction.user,
                true
            );
            console.error(e);
        }
    }
}
