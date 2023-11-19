import { Command } from "../def/Command.js";
import { replyWithEmbed } from "../def/replyWithEmbed.ts";
import { birthdayAnnouncementHandler } from "../handlers/BirthdayAnnouncementHandler.ts";

export const testCommand = new Command(
    "test",
    "test a secret thing!",
    async (interaction) => {
        await replyWithEmbed(
            interaction,
            "test command executed",
            "attempting to send birthday messages!",
            "info",
            undefined,
            true
        );
        await birthdayAnnouncementHandler();
    }
);
