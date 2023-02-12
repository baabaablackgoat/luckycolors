import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

// This is an incomplete mapping, but discord.js is just straight up awful about this, not exposing it themselves.
type ICommandOptionType =
    | "String"
    | "Integer"
    | "Number"
    | "Boolean"
    | "Role"
    | "User";
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
        options?: ICommandOption[]
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
