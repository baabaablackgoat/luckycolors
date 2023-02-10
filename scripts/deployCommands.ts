// set up env variables
import { config } from "dotenv";
config();
// remaining imports
import { REST, Routes } from "discord.js";
// @ts-ignore: shush u
import BotSettings from "../botSettings.json" assert { type: "json" };
import chalk from "chalk";
import { TermColors } from "../src/def/termColors.js";
import { enabledCommands } from "../src/enabledCommands.js";

enum deployType {
    Guilds,
    Global,
    All,
}

/**
 * Registers all known commands defined in the commands object above.
 * @param guilds: Defaults true. If set, will attempt to register the commands on all known guilds set in botSettings.json.
 * @param global: Defaults false. If set, will attempt to register the commands globally - subject to stricter ratelimits.
 */
export async function deployCommands(
    guilds = true,
    global = false
): Promise<void> {
    const deployData = [];
    enabledCommands.forEach((command) => {
        deployData.push(command.getRegistrationRequest());
    });

    const restClient = new REST({ version: "10" }).setToken(
        process.env.DISCORD_TOKEN
    );
    console.log(`Registering ${deployData.length} commands.`,
        `${guilds ? TermColors.OK("GUILDS") : TermColors.Error("GUILDS")}`,
        `${global ? TermColors.OK("GLOBAL") : TermColors.Error("GLOBAL")}`);
    try {
        if (guilds) {
            for (const guildID of BotSettings.guildIDs) {
                await restClient.put(
                    Routes.applicationGuildCommands(BotSettings.clientID, guildID),
                    { body: deployData }
                );
                console.log(TermColors.OK("DEPLOYED"), `to ${guildID}`);
            }
        }
        if (global) {
            // TODO: consider global deployment.
            console.log(chalk.bold.red("GLOBAL DEPLOYMENT NOT YET IMPLEMENTED."));
        }
    } catch (e) {
        console.error(chalk.bold.red("Failed to deploy slash commands."), e);
    }
}

let selectedDeploy: deployType;
switch (process.argv[2]) {
    case "guilds":
        selectedDeploy = deployType.Guilds;
        break;
    case "global":
        selectedDeploy = deployType.Global;
        break;
    case "all":
        selectedDeploy = deployType.All;
        break;
    default:
        console.error("No deploy target specified!");
        break;
}

const deployToGuilds = () => {
    return (
        selectedDeploy == deployType.Guilds || selectedDeploy == deployType.All
    );
};
const deployGlobally = () => {
    return (
        selectedDeploy == deployType.Global || selectedDeploy == deployType.All
    );
};

deployCommands(deployToGuilds(), deployGlobally()).then(() =>
    console.log("Deployment has finished.")
);
