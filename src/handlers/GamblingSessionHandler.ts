import { GuildMember, Snowflake, TextChannel } from "discord.js";
import { DataStorage } from "../def/DatabaseWrapper.ts";
import { ReadableTime } from "../def/ReadableTime.ts";
import { BotSettings } from "../def/SettingsHandler.ts";
import { getChannels } from "../def/GetChannels.ts";

class GamblingSession {
    private readonly timeout = 3 * 60 * 1e3;
    private guildMember: GuildMember;
    private startedAt: Date;
    private lastInteraction: Date;
    private startingCoins: number;
    constructor(user: GuildMember, startingCoins: number) {
        const now = new Date();
        this.guildMember = user;
        this.startedAt = now;
        this.lastInteraction = now;
        this.startingCoins = startingCoins;
    }

    get hasTimedOut(): boolean {
        return this.lastInteraction.getTime() + this.timeout < Date.now();
    }

    pingSession() {
        this.lastInteraction = new Date();
    }

    async printSessionResult(channel: TextChannel) {
        const newBalance = await DataStorage.getUserBalance(
            this.guildMember.id
        );
        const value = newBalance - this.startingCoins;
        const gambleTime = new ReadableTime(
            Date.now() - this.startedAt.getTime()
        );

        // FIXME: make me a translation string you lazy bum
        const messageTemplate = `\`\`\`diff
$prefix $tag gambled for $time, their balance changed by $value
\`\`\``;

        await channel.send(
            messageTemplate
                .replace("$prefix", value >= 0 ? "+" : "-")
                .replace("$tag", this.guildMember.displayName)
                .replace("$time", gambleTime.toString())
                .replace("$value", value.toString())
        );
    }
}

export class GamblingSessionHandler {
    private static instance: GamblingSessionHandler;
    public static getInstance() {
        if (!GamblingSessionHandler.instance) {
            console.log("new creation");
            GamblingSessionHandler.instance = new GamblingSessionHandler();
        }
        // console.log(GamblingSessionHandler.instance);
        return GamblingSessionHandler.instance;
    }

    private sessions: Map<Snowflake, GamblingSession>;
    private announcementChannel: TextChannel | undefined;
    ready: boolean = false;

    async setupAnnouncementChannels() {
        if (this.ready) return;
        const interactionChannelIds = BotSettings.getSetting(
            "interactionChannels"
        );
        if (Object.keys(interactionChannelIds).length === 0) {
            console.warn(
                "No interaction channels set. Gambling sessions will not be announced"
            );
            return;
        }
        const interactionChannels = await getChannels(interactionChannelIds);
        if (interactionChannels.length === 0) {
            console.error(
                `No interaction channels could be found to send a message to, gambling sessions will not be announced`
            );
            return;
        }
        this.announcementChannel = interactionChannels[0];
        this.ready = true;
        console.info(
            `First found interaction channel ${this.announcementChannel.name} was chosen to be the session print channel. Ready state is now ${this.ready}`
        );
    }

    private constructor() {
        this.sessions = new Map<Snowflake, GamblingSession>();
    }

    async createOrPingSession(target: GuildMember): Promise<GamblingSession> {
        const foundSession = this.sessions.get(target.id);
        if (foundSession !== undefined) {
            foundSession.pingSession();
            console.log("DEBUG", foundSession);
            return foundSession;
        } else {
            const startingBalance = await DataStorage.getUserBalance(target.id);
            const newSession = new GamblingSession(target, startingBalance);
            this.sessions.set(target.id, newSession);
            console.log("DEBUG", newSession);
            return newSession;
        }
    }

    async handleExpiredSessions() {
        if (!this.ready) {
            console.warn(
                `Attempted to handle expired gambling sessions, but handler not marked as ready: ${this.ready}, ${this.sessions}`
            );
            return;
        }

        Promise.all(
            Array.from(this.sessions.entries()).map(async ([key, session]) => {
                if (session.hasTimedOut) {
                    await session.printSessionResult(this.announcementChannel);
                    this.sessions.delete(key);
                }
            })
        ).catch((e) => console.error("Catch deez nuts", e));
    }
}

export const GamblingSessions = GamblingSessionHandler.getInstance();
