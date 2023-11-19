import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "./def/Command.js";

export class ClientStore {
    private static instance: CustomClient;

    public static getClient(): CustomClient {
        if (!ClientStore.instance) {
            ClientStore.instance = new CustomClient({
                intents: [GatewayIntentBits.Guilds],
            });
        }
        return ClientStore.instance;
    }
}

// Extending the base client to include a collection storing commands
export class CustomClient extends Client {
    commands = new Collection<string, Command>();
}
