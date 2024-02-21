import { ChatInputCommandInteraction } from "discord.js";
import { replyWithEmbed } from "./replyWithEmbed.js";
import { Lang } from "../lang/LanguageProvider";

/**
 * Returns a normalized stake (only whole numbers). If it is greater or less than the minimum or invalid in any other way, returns 0.
 * @param interaction: The interaction to reply to.
 * @param stake: The given stake to normalize.
 */

const maxStake = 25;
const minStake = 1;

export function getValidStake(
    interaction: ChatInputCommandInteraction,
    stake: number,
    max: number = maxStake,
    min: number = minStake
): number {
    if (stake < min || stake > max) {
        void replyWithEmbed(
            interaction,
            Lang("isValidStake_error_invalidStakeTitle"),
            Lang("isValidStake_error_invalidStakeDescription", {
                stake,
                min,
                max,
            }),
            "warn",
            interaction.user,
            true
        );
        return -1;
    }
    return Math.round(stake);
}
