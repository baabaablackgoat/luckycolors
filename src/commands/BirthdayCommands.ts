import { Command } from "../def/Command.js";
import { Lang } from "../lang/LanguageProvider.js";
import {
    ActionRowBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

export const sendBirthdayModal = async (
    interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
    const birthdayModal = new ModalBuilder()
        .setCustomId("birthdayModal")
        .setTitle(Lang("modal_birthday_title"));

    const dayInput = new TextInputBuilder()
        .setCustomId("birthday_day")
        .setLabel(Lang("modal_birthday_dayLabel"))
        .setStyle(TextInputStyle.Short)
        .setMaxLength(2)
        .setMinLength(1)
        .setPlaceholder("01")
        .setRequired(true);

    const monthInput = new TextInputBuilder()
        .setCustomId("birthday_month")
        .setLabel(Lang("modal_birthday_monthLabel"))
        .setStyle(TextInputStyle.Short)
        .setMaxLength(2)
        .setMinLength(1)
        .setPlaceholder("01")
        .setRequired(true);

    const yearInput = new TextInputBuilder()
        .setCustomId("birthday_year")
        .setLabel(Lang("modal_birthday_yearLabel"))
        .setStyle(TextInputStyle.Short)
        .setMaxLength(4)
        .setMinLength(4)
        .setPlaceholder("1990")
        .setRequired(false);
    const dayActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        dayInput
    );
    const monthActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(monthInput);
    const yearActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(yearInput);

    birthdayModal.addComponents([dayActionRow, monthActionRow, yearActionRow]);

    await interaction.showModal(birthdayModal);
};

export const setBirthday = new Command(
    Lang("command_setBirthday_name"),
    Lang("command_setBirthday_description"),
    sendBirthdayModal
);
