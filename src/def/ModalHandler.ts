import { ModalSubmitInteraction } from "discord.js";
import { replyWithEmbed } from "./replyWithEmbed.js";
import { Lang } from "../lang/LanguageProvider.js";
import { DataStorage } from "./DatabaseWrapper.js";
import { formatBirthday } from "./FormatBirthday";
import { assertAdminPermissions } from "./Command.ts";
import { BotSettings } from "./SettingsHandler.ts";
import { calculateExpectedSlotsValue } from "../commands/SlotsCommands.ts";

export class ModalHandler {
    static async birthday(interaction: ModalSubmitInteraction) {
        const day = parseInt(
            interaction.fields.getTextInputValue("birthday_day")
        );
        const month = parseInt(
            interaction.fields.getTextInputValue("birthday_month")
        );
        const yearString =
            interaction.fields.getTextInputValue("birthday_year");
        const year = parseInt(yearString);

        if (
            isNaN(day) ||
            isNaN(month) ||
            (yearString.length > 0 && isNaN(year))
        ) {
            void replyWithEmbed(
                interaction,
                Lang("birthday_error_parseFailureTitle"),
                Lang("birthday_error_parseFailureDescription"),
                "warn",
                interaction.user,
                true
            );
            return;
        }
        const tempBirthdayDate = new Date(`${year ?? 1990}-${month}-${day}`);
        if (
            isNaN(tempBirthdayDate.getTime()) ||
            Date.now() <= tempBirthdayDate.getTime()
        ) {
            void replyWithEmbed(
                interaction,
                Lang("birthday_error_invalidDateTitle"),
                Lang("birthday_error_invalidDateDescription"),
                "warn",
                interaction.user,
                true
            );
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const knownBirthday = await DataStorage.getBirthday(
            interaction.user.id
        );
        // Birthday can be canonically changed once if the year was not set, while only setting the year.
        // if the day is set, a birthday was previously set.
        // If a year is also set or no there is no attempt at setting it for the first time, reject changes.
        if (knownBirthday && (knownBirthday.year || yearString.length === 0)) {
            void replyWithEmbed(
                interaction,
                Lang("birthday_error_alreadySetTitle"),
                Lang("birthday_error_alreadySetDescription"),
                "warn",
                interaction.user,
                true
            );
            return;
        }
        await DataStorage.setBirthday(
            interaction.user.id,
            day,
            month,
            yearString.length > 0 ? year : null
        );
        void replyWithEmbed(
            interaction,
            Lang("birthday_reply_setTitle"),
            Lang("birthday_reply_setDescription", {
                birthday: formatBirthday({
                    day,
                    month,
                    year: yearString.length > 0 ? year : null,
                    announce: true,
                }),
            }),
            "info",
            interaction.user,
            true
        );
    }

    static async slotsFailWeightHandler(interaction: ModalSubmitInteraction) {
        if (!(await assertAdminPermissions(interaction))) return;

        const newWeight = parseInt(
            interaction.fields.getTextInputValue("slotsFailweightModal_weight")
        );
        if (isNaN(newWeight)) {
            void replyWithEmbed(
                interaction,
                "Invalid value",
                "The given weight value could not be parsed.",
                "warn",
                interaction.user,
                true
            );
            return;
        }
        if (newWeight < 0) {
            void replyWithEmbed(
                interaction,
                "Weight negative",
                "Weights cant be negative.",
                "warn",
                interaction.user,
                true
            );
            return;
        }
        BotSettings.setSetting("slotsNullWeight", newWeight);
        void replyWithEmbed(
            interaction,
            "Fail Weight updated",
            `New fail weight: ${newWeight}. New expected value: ${calculateExpectedSlotsValue()}`,
            "info",
            interaction.user,
            true
        );
    }

    static async slotsNullWeightHandler(interaction: ModalSubmitInteraction) {}
    static async slotsWeightsHandler(interaction: ModalSubmitInteraction) {}
}
