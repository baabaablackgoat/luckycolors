import { ChatInputCommandInteraction } from "discord.js";
import { replyWithEmbed } from "./replyWithEmbed.js";

/**
 * Returns a normalized stake (only whole numbers). If it is greater or less than the minimum or invalid in any other way, returns 0.
 * @param interaction: The interaction to reply to.
 * @param stake: The given stake to normalize.
 */

const maxStake = 25;
const minStake = 1;

export function getValidStake(
    interaction: ChatInputCommandInteraction,
    stake: number
): number {
    if (stake < minStake || stake > maxStake) {
        void replyWithEmbed(
            interaction,
            "Invalid stake",
            `Your stake must be between ${minStake} and ${maxStake}. Your stake: ${stake}`,
            "warn",
            interaction.user,
            true
        );
        return 0;
    }
    return Math.round(stake);
}
