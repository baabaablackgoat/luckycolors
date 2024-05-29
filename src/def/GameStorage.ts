import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Snowflake,
} from "discord.js";

export abstract class GameBase {
    stake: number;
    interaction: ChatInputCommandInteraction | ButtonInteraction;

    public get creationTime(): Date {
        return this.interaction.createdAt;
    }

    public get interactionID(): Snowflake {
        return this.interaction.id;
    }

    protected constructor(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        stake: number
    ) {
        this.interaction = interaction;
        this.stake = stake;
    }
}

interface ButtonGameInteraction {
    gameID: Snowflake;
    action: string;
    actionData?: string;
}

export abstract class GameStorage<T extends GameBase> {
    games: Array<T> = [];
    prefix: string;
    private readonly cleanupFunction: (id: Snowflake) => Promise<void>;
    protected constructor(
        prefix: string,
        renderCleanup: (id: Snowflake) => Promise<void>
    ) {
        this.prefix = prefix;
        this.games = [];
        this.cleanupFunction = renderCleanup;
        setInterval(this.cleanupTask.bind(this), 6e4);
    }
    public cleanupTask() {
        this.games.forEach((game) => {
            if (game.creationTime.getTime() + 6e5 <= Date.now()) {
                // ten minutes ago
                this.deleteGame(game.interactionID);
            }
        });
    }

    private deleteGame(interactionID: Snowflake) {
        this.games = this.games.filter(
            (game) => game.interactionID !== interactionID
        );
        void this.cleanupFunction(interactionID);
    }

    public findGame(interactionID: Snowflake) {
        return this.games.find((game) => game.interactionID === interactionID);
    }

    public splitButtonId(id: string): ButtonGameInteraction | null {
        const [gameName, gameID, action, actionData] = id.split("_");
        if (!gameName || !gameID || !action) {
            console.error(
                `Missing data while handling game button interaction. RAW: ${id}\nGAME: ${gameName} ID:${gameID} ACTION:${action} EXTRA DATA:${actionData}`
            );
            return null;
        }
        if (gameName !== this.prefix) {
            console.error(
                `Wrong game storage attempted to handle this interaction. Meant for ${gameName}, failed to handle by ${this.prefix}`
            );
            return null;
        }
        return {
            gameID,
            action,
            actionData,
        };
    }

    abstract createGame(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        stake: number
    ): void;
    abstract handleInteraction(buttonInteraction: ButtonInteraction): void;
}
