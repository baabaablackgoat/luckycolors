import { CommandInteraction, EmbedBuilder, User } from "discord.js";

type ReplyEmbedType = "info" | "warn" | "error";
export async function replyWithEmbed(
    interaction: CommandInteraction,
    title: string,
    description: string,
    type: ReplyEmbedType,
    author?: User,
    ephemeral?: boolean, // only works if this is the initial reply!
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

    if (interaction.deferred || interaction.replied)
        await interaction.editReply({ embeds: [replyEmbed] });
    else await interaction.reply({ embeds: [replyEmbed], ephemeral: ephemeral ?? false});
}
