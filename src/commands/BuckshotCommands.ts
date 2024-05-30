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
    BuckshotStorage.getInstance().createGame(interaction, stake);
}

enum BuckshotButtonInteractions {
    ShootSelf = "self",
    ShootDealer = "dealer",
    Item = "item",
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

    async handleInteraction(
        buttonInteraction: ButtonInteraction
    ): Promise<void> {
        const interactionData = this.getGameInteractionData(buttonInteraction);
        if (interactionData === null) {
            console.warn("Invalid interaction data, aborting coinshot handler");
            return;
        }
        const foundGame = this.findGame(interactionData.gameID);
        if (!foundGame) {
            console.warn(
                "Unknown Buckshot Game interaction ID received:",
                JSON.stringify(interactionData)
            );
            void replyWithEmbed(
                buttonInteraction,
                "Game ID unknown",
                "Something went wrong... that interaction had an unknown game ID.",
                "error",
                buttonInteraction.user,
                true
            );
            return;
        }
        // Execution guard
        // todo: for bonus points, pull this execution guard out into the GameStorage to make it work for everything
        await locks.request(
            `${this.prefix}_${interactionData.gameID}`,
            { ifAvailable: true },
            async (lock) => {
                if (!lock) {
                    replyWithEmbed(
                        buttonInteraction,
                        "Woah there!",
                        "This game is already being processed.",
                        "warn",
                        buttonInteraction.user,
                        true
                    );
                    return;
                }
                // actual interaction execution
                if (
                    !Object.keys(BuckshotButtonInteractions)
                        .filter((key) => isNaN(Number(key)))
                        .map((key) => BuckshotItem[key])
                        .includes(interactionData.action)
                ) {
                    console.warn(
                        "Invalid Buckshot Button Interaction received:",
                        JSON.stringify(interactionData)
                    );
                    void replyWithEmbed(
                        buttonInteraction,
                        "Invalid interaction",
                        "Something went wrong... I couldn't recognize that interaction.",
                        "error",
                        buttonInteraction.user,
                        true
                    );
                    return;
                }
                switch (interactionData.action) {
                    case BuckshotButtonInteractions.ShootSelf:
                        await foundGame.executeDecision(
                            foundGame.player,
                            foundGame.dealer,
                            BuckshotInteraction.ShootSelf
                        );
                        break;
                    case BuckshotButtonInteractions.ShootDealer:
                        await foundGame.executeDecision(
                            foundGame.player,
                            foundGame.dealer,
                            BuckshotInteraction.ShootOpponent
                        );
                        break;
                    case BuckshotButtonInteractions.Item:
                        switch (parseInt(interactionData.actionData)) {
                            case BuckshotItem.Saw:
                                await foundGame.executeDecision(
                                    foundGame.player,
                                    foundGame.dealer,
                                    BuckshotInteraction.UseSaw
                                );
                                break;
                            case BuckshotItem.Beer:
                                await foundGame.executeDecision(
                                    foundGame.player,
                                    foundGame.dealer,
                                    BuckshotInteraction.UseBeer
                                );
                                break;
                            case BuckshotItem.Cigarettes:
                                await foundGame.executeDecision(
                                    foundGame.player,
                                    foundGame.dealer,
                                    BuckshotInteraction.UseCigarettes
                                );
                                break;
                            case BuckshotItem.Handcuffs:
                                await foundGame.executeDecision(
                                    foundGame.player,
                                    foundGame.dealer,
                                    BuckshotInteraction.UseHandcuffs
                                );
                                break;
                            case BuckshotItem.Magnifier:
                                await foundGame.executeDecision(
                                    foundGame.player,
                                    foundGame.dealer,
                                    BuckshotInteraction.UseMagnifier
                                );
                                break;
                            default:
                                console.warn(
                                    "Invalid Buckshot Button Interaction received:",
                                    JSON.stringify(interactionData)
                                );
                                void replyWithEmbed(
                                    buttonInteraction,
                                    "Invalid item usage",
                                    "Something went wrong... No item was associated with that request.",
                                    "error",
                                    buttonInteraction.user,
                                    true
                                );
                                return;
                        }
                        break;
                }
            }
        );
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
    private _sawedOff: boolean;
    constructor() {}

    reload() {
        const chosenShells = randomInt(3, 9);
        const chosenLiveShells = randomInt(1, chosenShells - 1);
        this.chamber = new Chamber(chosenLiveShells, chosenShells);
    }

    checkChamber() {
        return this.chamber.checkNextShell();
    }

    shoot(): ShotOutcome {
        const shell = this.chamber.playNextShell();
        if (this._sawedOff) {
            this._sawedOff = false;
            return {
                damage: shell ? 2 : 0,
                shellsLeft: this.chamber.shellsLeft,
            };
        }
        return { damage: shell ? 1 : 0, shellsLeft: this.chamber.shellsLeft };
    }
    sawOff() {
        this._sawedOff = true;
    }
    get sawedOff() {
        return this._sawedOff;
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

class ShotgunPlayer {
    name: string;
    private maxInventory: 4; // limited to half because it'd be very tedious otherwise
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
        const chosenHealth = randomInt(3, 7);
        this.player = new ShotgunPlayer(chosenHealth);
        this.dealer = new ShotgunDealer(chosenHealth);
        this.turnPhase = BuckshotPhase.Reloading;
        this.turnOwner = this.player;
        void this.reloadSequence(); // will automatically trigger items and give turn to player
    }

    private get buttonPrefix() {
        return `${GameButtonPrefix}_${this.interaction.id}`;
    }

    stepTurn(target: ShotgunPlayer) {
        if (target.cuffed) {
            target.uncuff();
        } else {
            this.turnOwner = target;
        }
    }

    get gameOver() {
        return this.player.health <= 0 || this.dealer.health <= 0;
    }

    // call after action has been made to update relevant things
    async updateGameState() {
        // If the game is over, prevent everything else from happening, do one final render
        if (this.gameOver) {
            this.turnPhase = BuckshotPhase.Done;
            // todo: award the payout
            // todo: possibly open up for double or nothing
            await this.renderGame();
            return;
        }

        // if the shotgun is empty, shotgun must be reloaded.
        if (this.shotgun.chamber.shellsLeft) {
            this.turnPhase = BuckshotPhase.Reloading;
            // automatically perform reload steps after n seconds
            setTimeout(this.reloadSequence, 3000);
        }

        // render game after all relevant variables are up to date
        await this.renderGame();

        if (this.turnOwner == this.dealer) {
            // finally, queue next dealer action in n seconds
            setTimeout(() => {
                const dealerAction = this.dealer.chooseAction(
                    this.player.cuffed,
                    this.shotgun.sawedOff
                );
                this.executeDecision(this.dealer, this.player, dealerAction);
            }, 3000);
        }
    }

    handoutItems(target: ShotgunPlayer) {
        for (let i = 0; i < 2; i++) {
            const randomItem = randomInt(
                0,
                Object.keys(BuckshotItem).length / 2
            );
            target.addItem(randomItem);
        }
    }

    async reloadSequence() {
        // - hand out two items each
        this.handoutItems(this.player);
        this.handoutItems(this.dealer);
        // - reload shotgun
        this.shotgun.reload();
        // render game to show the recently loaded shells
        await this.renderGame();
        // after n seconds of reloading time, return to Playing Phase, give turn to player & trigger re-render
        setTimeout(async () => {
            this.turnPhase = BuckshotPhase.Playing;
            this.turnOwner = this.player;
            await this.renderGame();
        }, 5000);
    }

    async renderGame() {
        // todo: update texts based on game state
        const imagePath = await BrowserRenderer.getInstance().renderBuckshot(
            this.interaction.id,
            this
        );
        await replyWithEmbed(
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
                    .setCustomId(
                        `${this.buttonPrefix}_${BuckshotButtonInteractions.ShootSelf}`
                    ),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("🎯 Shoot the dealer")
                    .setCustomId(
                        `${this.buttonPrefix}_${BuckshotButtonInteractions.ShootDealer}`
                    ),
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
                        .setCustomId(
                            `${this.buttonPrefix}_${BuckshotButtonInteractions.Item}_${i}`
                        )
                );
            }
        }
        return [shootingRow, itemRow];
    }

    async executeDecision(
        target: ShotgunPlayer,
        opponent: ShotgunPlayer,
        decision: BuckshotInteraction
    ) {
        if (this.turnOwner !== target) {
            console.warn(
                `Attempted to execute decision ${decision} on behalf of ${target.name}, but it wasn't their turn: turnOwner is ${this.turnOwner}`
            );
            return;
        }
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
        await this.updateGameState();
    }

    shootSelf(target, opponent) {
        const outcome = this.shotgun.shoot();
        target.damage(outcome.damage);
        const live = outcome.damage > 0;
        this.dealer.knowledge.shellUsed(live);
        // todo don't just console.log stuff, make it do shit
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
        // todo don't just console.log stuff, make it do shit
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
        // todo don't just console.log stuff, make it do shit
        console.log(
            `${target.name} handcuffs ${opponent.name}. Their next turn will be skipped.`
        );
    }

    useCigarettes(target) {
        target.smoke();
        // todo don't just console.log stuff, make it do shit
        console.log(
            `${target.name} smokes a cigarette to take off the edge. They now have ${target.health} health.`
        );
    }

    useBeer(target) {
        target.drinkBeer();
        const outcome = this.shotgun.shoot();
        // todo don't just console.log stuff, make it do shit
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
        // todo don't just console.log stuff, make it do shit
        console.log(
            `${target.name} saws off the front half of the shotgun. The next shell deals double damage.`
        );
    }
    useMagnifier(target: ShotgunPlayer) {
        const isLive = this.shotgun.checkChamber();
        // todo don't just console.log stuff, make it do shit
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
