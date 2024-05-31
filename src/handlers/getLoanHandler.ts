import { ButtonInteraction } from "discord.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { Lang } from "../lang/LanguageProvider.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { randomInt } from "../def/randomInt.js";

export async function getLoanHandler(interaction: ButtonInteraction) {
    const balance = await DataStorage.getUserBalance(interaction.user.id);
    if (balance >= 25) {
        await replyWithEmbed(
            interaction,
            Lang("getLoan_reply_rejectedTitle"),
            Lang("getLoan_reply_rejectedDescription"),
            "warn",
            interaction.user,
            true,
            undefined,
            new URL("https://baabaablackgoat.com/res/salem/attorney.png")
        );
        return;
    }
    const loanValue = randomInt(25, 150);
    await DataStorage.addUserBalance(interaction.user.id, loanValue);
    void replyWithEmbed(
        interaction,
        Lang("getLoan_reply_acceptedTitle"),
        Lang("getLoan_reply_acceptedDescription", {
            value: loanValue,
            fakeValue: Math.ceil((loanValue / 35) * 100), // user gets to "keep" 35%, i take 65%. this is probably simplifiable
        }),
        "info",
        interaction.user,
        true,
        undefined,
        new URL("https://baabaablackgoat.com/res/salem/attorney.png")
    );
}
