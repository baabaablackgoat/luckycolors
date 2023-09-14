import {
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    ModalSubmitInteraction,
    User,
} from "discord.js";
import * as fs from "fs";

type ReplyEmbedType = "info" | "warn" | "error";

/**
 *
 * @param interaction - the interaction that will be replied to
 * @param title - the bolded text at the top.
 * @param description - the normal text at the bottom.
 * @param type - affects the design. can be any of {@link ReplyEmbedType}
 * @param author - will include this user in the embed at the top left.
 * @param ephemeral - if set to true, will ensure that the embed is only visible to that user. only works if this is initial reply.
 * @param actionRows - the interaction additions (e.g. buttons) to add
 * @param image - the embed image
 */
export async function replyWithEmbed(
    interaction:
        | CommandInteraction
        | ButtonInteraction
        | ModalSubmitInteraction,
    title: string,
    description: string,
    type: ReplyEmbedType,
    author?: User,
    ephemeral?: boolean, // only works if this is the initial reply!
    actionRows?: unknown, // I don't know which fucking type discord.js wants
    image?: URL | string
) {
    let files: string[] | undefined; // needed for custom reply embeds
    const replyEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description);
    switch (type) {
        case "info":
            replyEmbed.setColor(0xff0088);
            break;
        case "warn":
            replyEmbed.setColor(0xff8800);
            break;
        case "error":
            replyEmbed.setColor(0xff0000);
            break;
    }

    if (author !== undefined)
        replyEmbed.setAuthor({
            name: author.username,
            iconURL: author.avatarURL(),
        });
    if (image !== undefined) {
        // URLs are assumed to be external/hosted files.
        if (image instanceof URL) replyEmbed.setImage(image.toString());
        else {
            if (!fs.existsSync(image))
                throw new Error("Given path for Embed does not seem to exist.");
            replyEmbed.setImage(`attachment://${image.split("/").at(-1)}`);
            files = [image];
        }
    }

    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
            embeds: [replyEmbed],
            // @ts-ignore: Figure out which fucking type discord.js wants
            components: actionRows,
            files: files,
        });
    } else
        await interaction.reply({
            embeds: [replyEmbed],
            // @ts-ignore: Figure out which fucking type discord.js wants
            components: actionRows,
            ephemeral: ephemeral ?? false,
            files: files,
        });
}
