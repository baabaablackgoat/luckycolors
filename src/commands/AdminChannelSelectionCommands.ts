import { assertAdminPermissions, Command } from "../def/Command.js";
import { Lang } from "../lang/LanguageProvider.js";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { replyWithEmbed } from "../def/replyWithEmbed.ts";
import { BotSettings } from "../def/SettingsHandler.ts";

function assertTextChannel(
    interaction: ChatInputCommandInteraction,
    channel: any
): channel is TextChannel {
    if (!(channel instanceof TextChannel)) {
        void replyWithEmbed(
            interaction,
            "Invalid channel",
            "This is not a guild text channel!",
            "warn",
            interaction.user,
            true
        );
        return false;
    }
    return true;
}

export const setAnnouncementChannel = new Command(
    Lang("command_setAnnouncementChannel_name"),
    Lang("command_setAnnouncementChannel_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const targetChannel = interaction.options.getChannel(
            Lang("command_setAnnouncementChannel_argChannel")
        );
        if (!assertTextChannel(interaction, targetChannel)) return;
        const announcementChannelMap = BotSettings.getSetting(
            "announcementChannels"
        );
        announcementChannelMap[targetChannel.guild.id] = targetChannel.id;
        BotSettings.setSetting("announcementChannels", announcementChannelMap);
        void replyWithEmbed(
            interaction,
            "Channel set",
            `#${targetChannel.name} is now the designated announcement channel for **${targetChannel.guild.name}**.`,
            "info",
            interaction.user,
            true
        );
    },
    [
        {
            type: "TextChannel",
            name: Lang("command_setAnnouncementChannel_argChannel"),
            description: Lang(
                "command_setAnnouncementChannel_argChannelDescription"
            ),
        },
    ]
);

export const setInteractionChannel = new Command(
    Lang("command_setInteractionChannel_name"),
    Lang("command_setInteractionChannel_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        const targetChannel = interaction.options.getChannel(
            Lang("command_setInteractionChannel_argChannel")
        );
        if (!assertTextChannel(interaction, targetChannel)) return;
        const interactionChannelMap = BotSettings.getSetting(
            "interactionChannels"
        );
        interactionChannelMap[targetChannel.guild.id] = targetChannel.id;
        BotSettings.setSetting("interactionChannels", interactionChannelMap);
        void replyWithEmbed(
            interaction,
            "Channel set",
            `#${targetChannel.name} is now the designated interaction channel for **${targetChannel.guild.name}**.`,
            "info",
            interaction.user,
            true
        );
    },
    [
        {
            type: "TextChannel",
            name: Lang("command_setInteractionChannel_argChannel"),
            description: Lang(
                "command_setInteractionChannel_argChannelDescription"
            ),
        },
    ]
);
