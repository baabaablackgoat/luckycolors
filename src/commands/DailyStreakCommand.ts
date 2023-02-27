import { Command } from "../def/Command.js";
import { DatabaseWrapper } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { dateDayReducer } from "../def/DateDifference.js";

function getNextClaim(lastClaimed: Date): Date {
    const result = dateDayReducer(lastClaimed);
    result.setUTCDate(result.getUTCDate() + 1);
    return result;
}

class ReadableTime {
    hours: number;
    minutes: number;
    seconds: number;
    constructor(millis: number) {
        this.hours = Math.floor(millis / (1000 * 60 * 60));
        this.minutes = Math.floor(millis / (1000 * 60)) % 60;
        this.seconds = Math.floor(millis / 1000) % 60;
    }
    toString(seconds = false): string {
        if (seconds) return `${this.hours}:${this.minutes}:${this.seconds}`;
        else return `${this.hours}h${this.minutes}`;
    }
}

export const daily = new Command(
    "daily",
    "Claim your daily credits! Keeping a streak earns you more.",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const claimedCredits =
            await DatabaseWrapper.getInstance().claimDailyCredits(
                interaction.user.id
            );
        const timeToClaim = new ReadableTime(
            getNextClaim(claimedCredits.lastClaimed).getTime() - Date.now()
        );
        if (claimedCredits.received === 0) {
            // Already claimed credits today, should try again later
            void replyWithEmbed(
                interaction,
                "Already claimed today!",
                `Daily claims reset at midnight UTC. You can claim additional 🪙 in ${timeToClaim.toString()}.
                 Current streak: ${claimedCredits.streak}`,
                "warn",
                interaction.user
            );
            return;
        } else {
            void replyWithEmbed(
                interaction,
                "Daily credits claimed!",
                `You have received **${
                    claimedCredits.received
                }**🪙. You can claim more in ${timeToClaim.toString()}. Your current streak: **${
                    claimedCredits.streak
                }**`,
                "info",
                interaction.user
            );
        }
    }
);
