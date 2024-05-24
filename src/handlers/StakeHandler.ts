import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import { replyWithEmbed } from "../def/replyWithEmbed.ts";
import {
    DataStorage,
    InsufficientBalanceError,
} from "../def/DatabaseWrapper.ts";

const ohNoEmbed = new EmbedBuilder()
    .setTitle("...")
    .setDescription(
        "You wake up completely drenched at a riverbed with a throbbing headache, your pockets turned inside out. Your feet feel strangely heavy..."
    )
    .setColor(0x202050)
    .setImage("https://baabaablackgoat.com/res/salem/overspend4.png");

const ohNoRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId("menu_backEnter")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Return to title")
);

/**
 * Subtracts the given stake from the user, if possible. Otherwise casts them out into the sea. :)
 * @param interaction The related interaction
 * @param stake The stake to subtract
 * @returns true if successful, false if something went wrong. Use this as continued execution gate.
 */
export async function subtractStake(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    stake: number
): Promise<boolean> {
    if (isNaN(stake) || stake <= 0 || stake > 50) {
        void replyWithEmbed(
            interaction,
            "Invalid stake",
            `Invalid stake ${stake} rejected.`,
            "warn",
            interaction.user,
            true
        );
        return false;
    }
    try {
        await DataStorage.subtractUserBalance(interaction.user.id, stake);
        return true;
    } catch (e) {
        if (e instanceof InsufficientBalanceError) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    embeds: [ohNoEmbed],
                    components: [ohNoRow],
                });
            } else {
                interaction.reply({
                    embeds: [ohNoEmbed],
                    components: [ohNoRow],
                    ephemeral: true,
                });
            }
            /*void replyWithEmbed(
                    interaction,
                    "Not enough money",
                    "You can't stake 🪙 you don't have!",
                    "warn",
                    interaction.user,
                    true
                );
            */
            await DataStorage.setUserBalance(interaction.user.id, 0);
            return false;
        }
        console.error(
            `Unexpected error while attempting to subtract stake from ${interaction.user.tag}`,
            e
        );
        void replyWithEmbed(
            interaction,
            "Something went wrong",
            "I couldn't deduct the staked coins from your balance. If this persists, contact the author.",
            "warn",
            interaction.user,
            true
        );
        return false;
    }
}
