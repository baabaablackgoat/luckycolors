import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Snowflake,
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
import { assertAdminPermissions } from "./Command.ts";
import { removeItemButtonHandler } from "../commands/AdminShopCommands.ts";

function getItemID(customID: string): string {
    return customID.split("_")[1];
}

export class ButtonHandler {
    private static cooldown = 1500;
    private static lastUserInteraction: Record<Snowflake, Date> = {};
    private static userIsOnCooldown(interaction: ButtonInteraction): boolean {
        const now = new Date();
        const lastFoundInteraction =
            this.lastUserInteraction[interaction.user.id];
        // intentionally immediately update - punishing speedclickers with immediately extending the cooldown
        this.lastUserInteraction[interaction.user.id] = now;
        const onCooldown =
            lastFoundInteraction !== undefined &&
            new Date(lastFoundInteraction.getTime() + this.cooldown) > now;
        if (onCooldown)
            console.info(
                `User ${interaction.user.globalName} (${interaction.user.id}) has triggered the button cooldown`
            );
        return onCooldown;
    }
    static async equip(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
        void useItemHandler(interaction, getItemID(interaction.customId));
    }
    static async unlock(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
        await interaction.deferReply({ ephemeral: true });
        void unlockItemHandler(interaction, getItemID(interaction.customId));
    }
    static async remove(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
        await interaction.deferReply({ ephemeral: true });
        const itemID = getItemID(interaction.customId);
        // TODO
        await interaction.editReply(
            `todo: revoke item ID ${itemID}, coming soon i swear`
        );
    }
    static async page(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
        await interaction.deferUpdate();
        void pageChangeHandler(interaction);
    }

    static async drawCard(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
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
        if (this.userIsOnCooldown(interaction)) return;
        await BlackjackStorage.getInstance().handleInteraction(interaction);
    }

    static async menu(interaction: ButtonInteraction) {
        if (this.userIsOnCooldown(interaction)) return;
        await menuButtonHandler(interaction);
    }

    static async admin(interaction: ButtonInteraction) {
        if (!(await assertAdminPermissions(interaction))) return;
        if (this.userIsOnCooldown(interaction)) return;
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
                case "removeItem": {
                    await removeItemButtonHandler(interaction, subTarget);
                    break;
                }
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
