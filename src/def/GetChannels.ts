import { Snowflake, TextChannel } from "discord.js";
import { ClientStore } from "../ClientStore.ts";

export async function getChannels(channelIds: {
    [key: Snowflake]: Snowflake;
}): Promise<TextChannel[]> {
    const client = ClientStore.getClient();

    let channels: TextChannel[] = [];

    for (const guildId of Object.keys(channelIds)) {
        const channelId = channelIds[guildId];
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            if (!(channel instanceof TextChannel)) {
                console.error(
                    `The stored channel with ID ${channelId} was found in ${
                        guild.name
                    }, but was not a TextChannel: ${typeof channel}`
                );
            } else channels.push(channel);
        } catch (e) {
            console.error(
                `Something went wrong while trying to retrieve information about the guild with the ID ${guildId}`
            );
        }
    }
    return channels;
}
