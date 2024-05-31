import { BirthdayResponse, DataStorage } from "../def/DatabaseWrapper.js";
import { BotSettings } from "../def/SettingsHandler.js";
import { ClientStore } from "../ClientStore.js";
import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { formatBirthdayAge } from "../def/FormatBirthday.js";
import { Lang } from "../lang/LanguageProvider.js";
import { getChannels } from "../def/GetChannels.ts";

function createBirthdayEmbed(target: GuildMember, birthday: BirthdayResponse) {
    return new EmbedBuilder()
        .setTitle(
            Lang("publicBirthday_message_header", { name: target.displayName })
        )
        .setAuthor({
            name: target.displayName,
            iconURL: target.avatarURL(),
        })
        .setImage(Lang("publicBirthday_message_imageUrl"))
        .setDescription(
            Lang("publicBirthday_message_body", {
                age: formatBirthdayAge(birthday) ?? "",
            })
        );
}

interface FoundBirthdayMember {
    member: GuildMember;
    channel: TextChannel;
    birthday: BirthdayResponse;
}

export async function birthdayAnnouncementHandler() {
    // Check whether the necessary announcement settings have actually been set already
    const announcementChannelIds = BotSettings.getSetting(
        "announcementChannels"
    );
    if (Object.keys(announcementChannelIds).length === 0) {
        console.error(
            "Birthday announcement failed: no announcement channels set"
        );
        return;
    }

    // Before attempting to ask for channels from Discords API, check whether there are any birthdays today
    const allActiveBirthdays = await DataStorage.getAllActiveBirthdays();
    const announcedBirthdays = allActiveBirthdays.filter(
        (el) => el.birthday.announce
    );
    // TODO: Filter this list based on opt-out requests of users
    if (announcedBirthdays.length === 0) {
        console.log(`No birthdays today. Skipping.`);
        return;
    }

    const announcementChannels = await getChannels(announcementChannelIds);

    if (announcementChannels.length === 0) {
        console.error(
            `No announcement channels could be found to send a message to.`
        );
        return;
    }

    const foundBirthdayMembers: FoundBirthdayMember[] = [];
    for (const birthday of announcedBirthdays) {
        await Promise.all(
            announcementChannels.map(async (channel) => {
                const member = await channel.guild.members
                    .fetch(birthday.userId)
                    .catch((e) => {
                        console.log(
                            `Something went wrong while trying to fetch member ${birthday.userId} in ${channel.guild.name}: ${e}`
                        );
                    });
                if (member)
                    foundBirthdayMembers.push({
                        member: member,
                        channel: channel,
                        birthday: birthday.birthday,
                    });
            })
        );
    }

    if (foundBirthdayMembers.length === 0) {
        console.log(
            "There are pending birthdays and connected guilds, but none are currently members in the guilds. Skipping."
        );
        return;
    }

    console.log(
        `Sending ${foundBirthdayMembers.length} birthday announcements.`
    );

    foundBirthdayMembers.forEach((target) => {
        target.channel
            .send({
                embeds: [createBirthdayEmbed(target.member, target.birthday)],
            })
            .catch((e) => {
                console.error(
                    `Couldn't send the birthday message for ${target.member} in ${target.channel}: ${e}`
                );
            });
    });
}
