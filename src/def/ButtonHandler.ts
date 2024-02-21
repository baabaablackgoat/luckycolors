import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
} from "discord.js";
import { useItemHandler } from "../handlers/UseItemHandler";
import { unlockItemHandler } from "../handlers/UnlockItemHandler";
import { DeckStorage } from "./Deck";
import { replyWithEmbed } from "./replyWithEmbed";
import { BlackjackStorage } from "../commands/BlackjackCommands";
import { pageChangeHandler } from "../handlers/PageChangeHandler";
import { Lang } from "../lang/LanguageProvider";
import { menuButtonHandler } from "../menu/Menu";
import { slotsAdminButtonHandler } from "../commands/SlotsCommands.ts";

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
        await interaction.deferUpdate();
        void pageChangeHandler(interaction);
    }

    static async drawCard(interaction: ButtonInteraction) {
        try {
            const deckID = interaction.customId.split("_")[1];
            const deck = DeckStorage.getInstance().getDeck(deckID);
            void replyWithEmbed(
                interaction,
                Lang("card_reply_title"),
                Lang("card_reply_description", {
                    drawnCard: deck.drawCard().toString(),
                    cardsLeft: deck.cardCount,
                }),
                "info",
                interaction.user,
                true,
                [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel(Lang("card_button_drawAgain"))
                            .setCustomId(`drawCard_${deckID}`)
                            .setStyle(ButtonStyle.Primary)
                    ),
                ]
            );
        } catch (e) {
            void replyWithEmbed(
                interaction,
                Lang("card_error_deckMissingTitle"),
                Lang("card_error_deckMissingDescription"),
                "error",
                interaction.user,
                true
            );
            console.error(e);
        }
    }
    static async blackjack(interaction: ButtonInteraction) {
        await BlackjackStorage.getInstance().handleInteraction(interaction);
    }

    static async menu(interaction: ButtonInteraction) {
        await menuButtonHandler(interaction);
    }

    static async admin(interaction: ButtonInteraction) {
        try {
            const [_, target, subTarget] = interaction.customId.split("_");
            if (!target)
                console.warn(
                    "Admin interaction received that doesn't actually seem to have a target interaction - skipping"
                );
            switch (target) {
                case "slots":
                    await slotsAdminButtonHandler(interaction, subTarget);
                    break;
                default:
                    void replyWithEmbed(
                        interaction,
                        "Invalid admin interaction",
                        "This interaction seems to have a broken ID",
                        "warn",
                        interaction.user,
                        true
                    );
                    console.warn(
                        `Invalid admin interaction received - target ${target} was not found`
                    );
            }
        } catch (e) {
            console.error(
                "Something went wrong while handling an administrative button interaction",
                e
            );
        }
    }
}
