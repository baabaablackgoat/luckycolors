// Set up env vars for token
import { config } from "dotenv";
// Remaining imports
import { Events, GatewayIntentBits } from "discord.js";
import { TermColors } from "./def/termColors.js";
import { enabledCommands } from "./enabledCommands.js";
import { ButtonHandler } from "./def/ButtonHandler.js";
import { ModalHandler } from "./def/ModalHandler.js";
import { ButtonAction } from "./buttons/InventoryButtons.js";
import { BrowserRenderer } from "./webrender/BrowserRenderer.js";
import { ClientStore } from "./ClientStore.js";
import { ScheduledTask } from "./def/ScheduledTask.js";
import { birthdayAnnouncementHandler } from "./handlers/BirthdayAnnouncementHandler.js";

config();
const token: string = process.env.DISCORD_TOKEN;
const client = ClientStore.getClient();

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
            console.error(
                new Error(`Error executing ${interaction.commandName}`, {
                    cause: e,
                })
            );
        }
    } else if (interaction.isButton()) {
        try {
            const buttonAction = interaction.customId.split(
                "_"
            )[0] as ButtonAction;
            switch (buttonAction) {
                case "equip":
                    void ButtonHandler.equip(interaction);
                    break;
                case "remove":
                    void ButtonHandler.remove(interaction);
                    break;
                case "unlock":
                    void ButtonHandler.unlock(interaction);
                    break;
                case "page":
                    void ButtonHandler.page(interaction);
                    break;
                case "drawCard":
                    void ButtonHandler.drawCard(interaction);
                    break;
                case "blackjack":
                    void ButtonHandler.blackjack(interaction);
                    break;
                case "menu":
                    void ButtonHandler.menu(interaction);
                    break;
                default:
                    console.log(
                        "Invalid button interaction ID received, doing nothing"
                    );
                    break;
            }
        } catch (e) {
            console.error(
                new Error(
                    `Error responding to button interaction ${interaction.customId}`,
                    { cause: e }
                )
            );
        }
    } else if (interaction.isModalSubmit()) {
        try {
            switch (interaction.customId) {
                case "birthdayModal":
                    void ModalHandler.birthday(interaction);
                    break;
                default:
                    console.log(
                        "Invalid modal interaction ID received, doing nothing"
                    );
                    break;
            }
        } catch (e) {
            console.error(
                new Error(
                    `Error responding to modal interaction ${interaction.customId}`,
                    { cause: e }
                )
            );
        }
    } else {
        console.log(
            "Different interaction type received, ignoring.",
            interaction
        );
    }
});

// We don't want to reuse the token - void is fine here.
void client.login(token);

// instantiate the browser renderer early on purpose.
BrowserRenderer.getInstance();

// Register the scheduled tasks.
const birthdayTask = new ScheduledTask(
    "birthdayAnnouncements",
    "0 0 0 * * *",
    birthdayAnnouncementHandler
);
