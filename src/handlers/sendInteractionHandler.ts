import { BotSettings } from "../def/SettingsHandler.ts";
import { getChannels } from "../def/GetChannels.ts";
import { ClientStore } from "../ClientStore.ts";
import {
    publicMenuEntranceButtonRow,
    publicMenuEntranceEmbed,
} from "../menu/Menu.ts";

export async function sendInteractionHandler() {
    const minMessagesBeforeSend = 20;
    const client = ClientStore.getClient();
    const interactionChannelIds = BotSettings.getSetting("interactionChannels");
    if (Object.keys(interactionChannelIds).length === 0) {
        console.warn(
            "No interaction channels set, not attempting to send the menu embed"
        );
        return;
    }
    const interactionChannels = await getChannels(interactionChannelIds);
    if (interactionChannels.length === 0) {
        console.error(
            `No interaction channels could be found to send a message to, skipping menu embed sending`
        );
        return;
    }
    interactionChannels.forEach((channel) => {
        channel.messages
            .fetch({ limit: minMessagesBeforeSend })
            .then((messages) => {
                const ownMessages = messages.filter(
                    (msg) => msg.author.id == client.user.id
                );
                if (ownMessages.size > 0) {
                    console.info(
                        `Nothing to do, last ${minMessagesBeforeSend} messages include own message in ${channel.id}`
                    );
                    return;
                }
                channel
                    .send({
                        embeds: [publicMenuEntranceEmbed],
                        components: publicMenuEntranceButtonRow,
                    })
                    .then((msg) =>
                        console.info(
                            `Sent interaction message to ${msg.channel.id}`
                        )
                    )
                    .catch((e) =>
                        console.warn(`Couldnt send interaction message: ${e}`)
                    );
            });
    });
}
