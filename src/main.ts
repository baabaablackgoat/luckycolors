// Set up env vars for token
import { config } from "dotenv";
config();
const token: string = process.env.DISCORD_TOKEN;

// Remaining imports
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { TermColors } from "./def/termColors.js";
import { enabledCommands } from "./enabledCommands.js";
import { Command } from "./def/Command.js";

// Extending the base client to include a collection storing commands
class CustomClient extends Client {
    commands = new Collection<string, Command>();
}

// Making the command functions accessible through the client.
const client = new CustomClient({ intents: [GatewayIntentBits.Guilds] });
enabledCommands.forEach((command) => {
    client.commands.set(command.commandData.name, command);
});

// Ready event handler
client.once(Events.ClientReady, (event) => {
    console.log(`${TermColors.OK("READY")} Logged in as ${event.user.tag}`);
});

// Interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        try {
            const targetedCommand = client.commands.get(
                interaction.commandName
            );
            await targetedCommand.execute(interaction);
        } catch (e) {
            const error = new Error(`Error executing ${interaction.commandName}`, {cause: e});
            console.error(error);
        }
    } else {
        console.log("Different interaction type received", interaction);
    }
});

// We don't want to reuse the token - void is fine here.
void client.login(token);
