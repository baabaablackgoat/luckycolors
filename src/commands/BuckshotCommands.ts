import { Command } from "../def/Command.ts";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
} from "discord.js";
import { randomInt } from "../def/randomInt.ts";
import { shuffleArray } from "../def/ShuffleArray.ts";
import { replyWithEmbed } from "../def/replyWithEmbed.ts";
import { locks } from "../def/LockManager.ts";
import { BrowserRenderer } from "../webrender/BrowserRenderer.ts";
import { GameBase, GameStorage } from "../def/GameStorage.ts";

const GameButtonPrefix = "buckshot";

// Please play and support Buckshot Roulette:
// https://mikeklubnika.itch.io/buckshot-roulette
// https://store.steampowered.com/app/2835570/Buckshot_Roulette/
export const buckshotCommand = new Command(
    "buckshot",
    "Play a terrible knockoff of Buckshot Roulette, adapted for Discord",
    buckshotExecute
);

export async function buckshotExecute(
    interaction: ChatInputCommandInteraction | ButtonInteraction
) {
    // todo: choose and deduct stake
    const stake = 5;
    const shellCount = randomInt(3, 9);
}

export class BuckshotStorage extends GameStorage<BuckshotGame> {
    static instance: BuckshotStorage;
    private constructor() {
        super(GameButtonPrefix, BrowserRenderer.getInstance().cleanupBuckshot);
    }
    public static getInstance() {
        if (!BuckshotStorage.instance)
            BuckshotStorage.instance = new BuckshotStorage();
        return BuckshotStorage.instance;
    }

    createGame(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        stake: number
    ): void {
        this.games.push(new BuckshotGame(interaction, stake));
    }

    handleInteraction(buttonInteraction: ButtonInteraction): void {
        if (!buttonInteraction.customId.startsWith("buckshot")) {
            console.error(
                `Interaction ${buttonInteraction.customId} wrongly given to buckshot handler, ignoring.`
            );
            return;
        }
        // implement actions
    }
}

class Chamber {
    private readonly shells: Array<boolean>;
    public insertedLive: number;
    public insertedTotal: number;
    constructor(live: number, total: number) {
        this.insertedLive = live;
        this.insertedTotal = total;
        if (live > total)
            throw new RangeError(
                "More live shells than total shells in chamber."
            );
        this.shells = [...Array(total).keys()].map((i) => i < live);
        shuffleArray(this.shells);
    }
    checkNextShell() {
        return this.shells[0];
    }
    playNextShell() {
        return this.shells.shift();
    }
    get shellsLeft() {
        return this.shells.length;
    }
}

interface ShotOutcome {
    damage: 0 | 1 | 2;
    shellsLeft: number;
}

class Shotgun {
    chamber: Chamber;
    private sawedOff: boolean;
    constructor() {}

    loadShotgun() {
        const chosenShells = randomInt(3, 9);
        const chosenLiveShells = randomInt(1, chosenShells - 1);
        this.chamber = new Chamber(chosenLiveShells, chosenShells);
    }

    checkChamber() {
        return this.chamber.checkNextShell();
    }

    shoot(): ShotOutcome {
        const shell = this.chamber.playNextShell();
        if (this.sawedOff) {
            this.sawedOff = false;
            return {
                damage: shell ? 2 : 0,
                shellsLeft: this.chamber.shellsLeft,
            };
        }
        return { damage: shell ? 1 : 0, shellsLeft: this.chamber.shellsLeft };
    }
    sawOff() {
        this.sawedOff = true;
    }
}

export enum BuckshotItem {
    Saw,
    Handcuffs,
    Cigarettes,
    Magnifier,
    Beer,
}

class BuckshotInvalidActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BuckshotInvalidActionError";
    }
}

// todo disable this export
export class ShotgunPlayer {
    name: string;
    private maxInventory: 8;
    private _health: number;
    maxHealth: number;
    public get health() {
        return this._health;
    }
    public damage(amt: number) {
        this._health = Math.max(this._health - amt, 0);
        return this._health;
    }
    public heal() {
        this._health = Math.min(this._health + 1, this.maxHealth);
    }

    private readonly _inventory: BuckshotItem[] = [];
    public get inventory() {
        return this._inventory;
    }
    public addItem(item: BuckshotItem) {
        if (this._inventory.length >= this.maxInventory) return false;
        this._inventory.push(item);
    }
    public removeItem(item: BuckshotItem) {
        const foundIndex = this._inventory.indexOf(item);
        if (foundIndex < 0)
            throw new BuckshotInvalidActionError(
                `User attempted to use item ${BuckshotItem[item]} but does not own it`
            );
        this._inventory.splice(foundIndex, 1);
        return true;
    }

    private _cuffed: boolean = false;
    cuff() {
        if (this._cuffed)
            throw new BuckshotInvalidActionError(
                `Player can't be cuffed twice`
            );
        this._cuffed = true;
    }
    uncuff() {
        if (this._cuffed)
            throw new BuckshotInvalidActionError(
                `Uncuffed player can't be uncuffed again!`
            );
        this._cuffed = false;
    }
    get cuffed() {
        return this._cuffed;
    }

    constructor(health: number) {
        this._health = health;
        this.maxHealth = health;
    }

    smoke() {
        if (!this.removeItem(BuckshotItem.Cigarettes))
            throw new BuckshotInvalidActionError(
                `${this.name} tried to smoke but had no cigarettes`
            );
        this.heal();
    }
    private _drunkBeer: number = 0;
    get drunkBeer() {
        return `${this._drunkBeer}ml`;
    }
    drinkBeer() {
        this._drunkBeer += 330;
    }
}

enum BuckshotInteraction {
    ShootSelf,
    ShootOpponent,
    UseCigarettes,
    UseSaw,
    UseHandcuffs,
    UseBeer,
    UseMagnifier,
}

class DealerKnowledge {
    private readonly totalShells: number;
    private readonly liveShells: number;
    private shotLives: number;
    private shotBlanks: number;
    seenNextShell: boolean | undefined;
    shellUsed(type: boolean) {
        this.seenNextShell = undefined;
        type ? this.shotLives++ : this.shotBlanks++;
    }
    get perceivedRisk(): number {
        if (this.seenNextShell !== undefined) return this.seenNextShell ? 1 : 0;
        return (
            (this.liveShells - this.shotLives) /
            (this.totalShells - this.shotLives - this.shotBlanks)
        );
    }
    constructor(live: number, total: number) {
        this.liveShells = live;
        this.totalShells = total;
    }
}

class ShotgunDealer extends ShotgunPlayer {
    knowledge: DealerKnowledge;
    // fixme: move playerIsCuffed && sawedoff to game knowledge
    chooseAction(playerIsCuffed: boolean, sawedoff: boolean) {
        // always use smokes if health was lost
        if (
            this.health < this.maxHealth &&
            this.inventory.includes(BuckshotItem.Cigarettes)
        )
            return BuckshotInteraction.UseCigarettes;

        // use magnifiers whenever possible
        if (
            this.inventory.includes(BuckshotItem.Magnifier) &&
            this.knowledge.seenNextShell !== undefined
        )
            return BuckshotInteraction.UseMagnifier;

        // use handcuffs whenever possible
        if (this.inventory.includes(BuckshotItem.Handcuffs) && !playerIsCuffed)
            return BuckshotInteraction.UseHandcuffs;

        // if shotgun was sawed off, immediately shoot
        if (sawedoff) return BuckshotInteraction.ShootOpponent;

        // if the shotgun isn't sawed off but dealer has the item available, saw off shotgun to shoot enemy on next turn if risk > .5
        if (
            this.inventory.includes(BuckshotItem.Saw) &&
            this.knowledge.perceivedRisk > 0.5
        )
            return BuckshotInteraction.UseSaw;

        // The dealer is an alcoholic and will always drink beer unless the risk is > 75% or the shotgun was sawed off (covered above) in both cases he shoots his opponent
        if (
            this.inventory.includes(BuckshotItem.Beer) &&
            this.knowledge.perceivedRisk < 0.75
        )
            return BuckshotInteraction.UseBeer;

        // If no items can be used sensibly anymore, the dealer uses risk as random chance to shoot the enemy unless above the risk considered "safe", guaranteeing a shot attempt
        // If the player is cuffed, the dealer is more prone to shooting the player
        const safeRisk = playerIsCuffed ? 0.4 : 0.75;
        return this.knowledge.perceivedRisk >= safeRisk ||
            Math.random() < this.knowledge.perceivedRisk
            ? BuckshotInteraction.ShootOpponent
            : BuckshotInteraction.ShootSelf;
    }
}

export enum BuckshotPhase {
    Reloading,
    Playing,
    Done,
}

export class BuckshotGame extends GameBase {
    shotgun: Shotgun;
    player: ShotgunPlayer;
    dealer: ShotgunDealer;
    turnOwner: ShotgunPlayer;
    turnPhase: BuckshotPhase;
    constructor(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        stake: number
    ) {
        super(interaction, stake);
    }

    private get buttonPrefix() {
        return `${GameButtonPrefix}_${this.interaction.id}`;
    }

    // Use this wrapper to ensure execution guarding
    public async performPlayerAction(
        newInteraction: ButtonInteraction,
        action: () => Promise<void>
    ) {
        await locks.request(
            this.interaction.id,
            { ifAvailable: true },
            async (lock) => {
                if (!lock) {
                    // lock already blocked out, reject interaction
                    void replyWithEmbed(
                        newInteraction,
                        "Woah there",
                        "This game is already being processed, slow down!",
                        "warn",
                        newInteraction.user,
                        true
                    );
                    return;
                }
                await action();
            }
        );
    }

    stepTurn(target: ShotgunPlayer) {
        if (target.cuffed) {
            target.uncuff();
        } else {
            this.turnOwner = target;
        }
    }

    async updateGame() {
        this.renderGame();
    }

    async renderGame() {
        const imagePath = await BrowserRenderer.getInstance().renderBuckshot(
            this.interaction.id,
            this
        );
        replyWithEmbed(
            this.interaction,
            "Buckshot Roulette",
            "TODO Put cool text here",
            "info",
            this.interaction.user,
            true,
            this.getPlayerButtons(),
            imagePath
        );
    }

    getPlayerButtons(): ActionRowBuilder<ButtonBuilder>[] {
        // return no buttons if it's not the player's turn or the game is not in active play
        if (
            this.turnOwner != this.player ||
            this.turnPhase !== BuckshotPhase.Playing
        )
            return [];
        const shootingRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            [
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("🎯 Shoot yourself")
                    .setCustomId(`${this.buttonPrefix}_shootSelf`),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("🎯 Shoot the dealer")
                    .setCustomId(`${this.buttonPrefix}_shootDealer`),
            ]
        );
        // warning: if there's any more items added, there's a chance items need to be split to two rows! limit of 5/row
        const itemRow = new ActionRowBuilder<ButtonBuilder>();
        const allItems = Object.keys(BuckshotItem)
            .filter((key) => isNaN(Number(key)))
            .map((key) => BuckshotItem[key]);
        for (let i = 0; i < allItems.length; i++) {
            if (this.player.inventory.includes(allItems[i])) {
                itemRow.addComponents(
                    new ButtonBuilder()
                        .setLabel(`📦 Use ${BuckshotItem[allItems[i]]}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`${this.buttonPrefix}_item_${i}`)
                );
            }
        }
        return [shootingRow, itemRow];
    }

    executeDecision(
        target: ShotgunPlayer,
        opponent: ShotgunPlayer,
        decision: BuckshotInteraction
    ) {
        switch (decision) {
            case BuckshotInteraction.ShootSelf:
                this.shootSelf(target, opponent);
                break;
            case BuckshotInteraction.ShootOpponent:
                this.shootOpponent(target, opponent);
                break;
            case BuckshotInteraction.UseCigarettes:
                this.useCigarettes(target);
                break;
            case BuckshotInteraction.UseSaw:
                this.useSaw(target);
                break;
            case BuckshotInteraction.UseHandcuffs:
                this.useHandcuffs(target, opponent);
                break;
            case BuckshotInteraction.UseBeer:
                this.useBeer(target);
                break;
            case BuckshotInteraction.UseMagnifier:
                this.useMagnifier(target);
                break;
        }
    }

    shootSelf(target, opponent) {
        const outcome = this.shotgun.shoot();
        target.damage(outcome.damage);
        const live = outcome.damage > 0;
        this.dealer.knowledge.shellUsed(live);
        console.log(
            `${target.name} aims the shotgun at themselves... ${
                live
                    ? ` and it fires, dealing ${outcome.damage} damage.`
                    : "and it clicks harmlessly."
            }`
        );
        if (!live) this.stepTurn(opponent);
    }

    shootOpponent(target, opponent) {
        const outcome = this.shotgun.shoot();
        opponent.damage(outcome.damage);
        const live = outcome.damage > 0;
        this.dealer.knowledge.shellUsed(live);
        console.log(
            `${target.name} aims the shotgun at ${opponent.name}... ${
                live
                    ? ` and it fires, dealing ${outcome.damage} damage.`
                    : "and it clicks harmlessly."
            }`
        );

        this.stepTurn(opponent);
    }

    useHandcuffs(target, opponent) {
        opponent.cuff();
        console.log(
            `${target.name} handcuffs ${opponent.name}. Their next turn will be skipped.`
        );
    }

    useCigarettes(target) {
        target.smoke();
        console.log(
            `${target.name} smokes a cigarette to take off the edge. They now have ${target.health} health.`
        );
    }

    useBeer(target) {
        target.drinkBeer();
        const outcome = this.shotgun.shoot();
        console.log(
            `${
                target.name
            } downs a beer and cocks the shotgun. The shell would have been ${
                outcome.damage > 0 ? "live" : "a blank"
            }.`
        );
    }
    useSaw(target) {
        this.shotgun.sawOff();
        console.log(
            `${target.name} saws off the front half of the shotgun. The next shell deals double damage.`
        );
    }
    useMagnifier(target: ShotgunPlayer) {
        const isLive = this.shotgun.checkChamber();
        if (target instanceof ShotgunDealer) {
            console.log(
                `${target.name} checks the chamber in secret. Very interesting...`
            );
            target.knowledge.seenNextShell = isLive;
            return;
        }
        console.log(
            `${target.name} checks the chamber in secret. The next round is ${
                isLive ? "red" : "blue"
            }.`
        );
    }
}
