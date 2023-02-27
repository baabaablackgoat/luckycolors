import {
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    User,
} from "discord.js";

type ReplyEmbedType = "info" | "warn" | "error";
export async function replyWithEmbed(
    interaction: CommandInteraction | ButtonInteraction,
    title: string,
    description: string,
    type: ReplyEmbedType,
    author?: User,
    ephemeral?: boolean, // only works if this is the initial reply!
    actionRows?: unknown // I don't know which fucking type discord.js wants
) {
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

    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
            embeds: [replyEmbed],
            // @ts-ignore: Figure out which fucking type discord.js wants
            components: actionRows,
        });
    } else
        await interaction.reply({
            embeds: [replyEmbed],
            // @ts-ignore: Figure out which fucking type discord.js wants
            components: actionRows,
            ephemeral: ephemeral ?? false,
        });
}
