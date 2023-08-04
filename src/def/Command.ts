import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder,
    ChannelType,
    ButtonInteraction,
} from "discord.js";
import { replyWithEmbed } from "./replyWithEmbed.js";

// This is an incomplete mapping, but discord.js is just straight up awful about this, not exposing it themselves.
type ICommandOptionType =
    | "String"
    | "Integer"
    | "Number"
    | "Boolean"
    | "Role"
    | "User"
    | "TextChannel";
interface ICommandOption {
    type: ICommandOptionType;
    name: string;
    description: string;
    required?: boolean;
}

export class Command {
    commandData: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    constructor(
        name: string,
        description: string,
        execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
        options?: ICommandOption[],
        permissionFlags?: any
    ) {
        this.commandData = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
        this.execute = execute;
        if (options !== undefined) {
            options.forEach((option) => {
                switch (option.type) {
                    case "String":
                        this.commandData.addStringOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "Boolean":
                        this.commandData.addBooleanOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "Integer":
                        this.commandData.addIntegerOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "Number":
                        this.commandData.addNumberOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "Role":
                        this.commandData.addRoleOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "User":
                        this.commandData.addUserOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                        );
                        break;
                    case "TextChannel":
                        this.commandData.addChannelOption((o) =>
                            o
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required ?? false)
                                .addChannelTypes(ChannelType.GuildText)
                        );
                        break;
                }
            });
        }
    }

    /**
     * Creates the JSON object required to register this slash command with Discord.
     * This is just a simple semantic wrapper.
     */
    getRegistrationRequest = () => {
        return this.commandData.toJSON();
    };
}

/**
 * Checks whether the member calling this command is allowed to perform this command.
 * @param interaction The performed interaction
 * @returns true if allowed, false if not. False will answer the interaction.
 */
export async function assertAdminPermissions(
    interaction: ChatInputCommandInteraction
): Promise<boolean> {
    if (!interaction.member || !(interaction.member instanceof GuildMember)) {
        await replyWithEmbed(
            interaction,
            "Couldn't determine access",
            "I'm not sure if you're allowed to run this command...",
            "warn"
        );
        return false;
    }
    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    ) {
        await replyWithEmbed(
            interaction,
            "No permission",
            "You're not allowed to use this command.",
            "error"
        );
        return false;
    }
    return true;
}
