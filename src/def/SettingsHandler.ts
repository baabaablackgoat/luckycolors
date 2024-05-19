import { Snowflake } from "discord.js";
import { readFileSync, writeFile } from "fs";
import { SlotSymbol } from "../commands/SlotsCommands.ts";

interface ISettings {
    interactionChannels: { [key: Snowflake]: Snowflake };
    announcementChannels: { [key: Snowflake]: Snowflake };
    guildIds: Snowflake[];
    clientId: string;
    slotWeights: Record<string, SlotSymbol>;
    slotsNullWeight: number;
}

const settingsFileLocation = "./botSettings.json";

class SettingsHandler {
    private settings: ISettings;
    public constructor() {
        this.settings = this.loadSettings();
    }
    public getSetting<K extends keyof ISettings>(key: K): ISettings[K] {
        return this.settings[key];
    }
    // TODO: make this work with the object notation of interactionChannels and announcementChannels
    public setSetting<K extends keyof ISettings>(key: K, value: ISettings[K]) {
        this.settings[key] = value;
        this.persistSettings();
    }

    private loadSettings(): ISettings {
        const rawData = readFileSync(settingsFileLocation);
        const possibleSettings = JSON.parse(rawData.toString());
        return possibleSettings as ISettings;
    }
    private async persistSettings(): Promise<void> {
        const newData = JSON.stringify(this.settings, null, "\t");
        writeFile(settingsFileLocation, newData, () => {
            console.log("New bot settings persisted");
        });
    }
}

export const BotSettings = new SettingsHandler();
