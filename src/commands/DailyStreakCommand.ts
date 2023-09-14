import { Command } from "../def/Command.js";
import { DatabaseWrapper } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { dateDayReducer } from "../def/DateDifference.js";
import { Lang } from "../lang/LanguageProvider";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { numberToPosition } from "../def/NumberToPosition";

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
    Lang("command_daily_name"),
    Lang("command_daily_description"),
    async (interaction) => {
        void dailyExecute(interaction);
    }
);

export const dailyExecute = async (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
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
            Lang("daily_error_alreadyClaimedTitle"),
            Lang("daily_error_alreadyClaimedDescription", {
                timeToClaim: timeToClaim.toString(),
                streak: claimedCredits.streak,
            }),
            "warn",
            interaction.user
        );
        return;
    } else {
        if (claimedCredits.isBirthday) {
            void replyWithEmbed(
                interaction,
                Lang("daily_reply_birthdayTitle", {
                    age: claimedCredits.userAge
                        ? numberToPosition(claimedCredits.userAge) + " "
                        : "",
                }),
                Lang("daily_reply_birthdayDescription", {
                    received: claimedCredits.received,
                    timeToClaim: timeToClaim.toString(),
                    streak: claimedCredits.streak,
                }),
                "info",
                interaction.user
            );
            return;
        }
        void replyWithEmbed(
            interaction,
            Lang("daily_reply_claimedTitle"),
            Lang("daily_reply_claimedDescription", {
                received: claimedCredits.received,
                timeToClaim: timeToClaim.toString(),
                streak: claimedCredits.streak,
            }),
            "info",
            interaction.user
        );
    }
};
