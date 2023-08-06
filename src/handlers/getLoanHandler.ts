import { ButtonInteraction } from "discord.js";
import { replyWithEmbed } from "../def/replyWithEmbed";
import { Lang } from "../lang/LanguageProvider";

export async function getLoanHandler(interaction: ButtonInteraction) {
    await replyWithEmbed(
        interaction,
        Lang("getLoan_reply_rejectedTitle"),
        Lang("getLoan_reply_rejectedDescription"),
        "warn",
        interaction.user
    );
}
