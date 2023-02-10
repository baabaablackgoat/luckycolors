import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";

export class Command {
    commandData: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    constructor(name: string, description: string, execute: (interaction: ChatInputCommandInteraction) => Promise<void>) {
        this.commandData = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);

        this.execute = execute;
    }

    /**
     * Creates the JSON object required to register this slash command with Discord.
     * This is just a simple semantic wrapper.
     */
    getRegistrationRequest = () => {
        return this.commandData.toJSON();
    }

}