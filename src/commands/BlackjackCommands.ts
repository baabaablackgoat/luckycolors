import { Command } from "../def/Command.js";
import { Card, Deck, DeckStorage } from "../def/Deck.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Snowflake,
} from "discord.js";
import {
    DataStorage,
    InsufficientBalanceError,
} from "../def/DatabaseWrapper.js";
import { getValidStake } from "../def/isValidStake.js";
import { BrowserRenderer } from "../webrender/BrowserRenderer.js";

export const drawCard = new Command(
    "card",
    "Draw a random card from a virtually shuffled deck.",
    async (interaction) => {
        const decks = DeckStorage.getInstance();
        const deck = decks.createDeck(interaction.id);
        void replyWithEmbed(
            interaction,
            "You've drawn...",
            `${deck.drawCard().toString()}\nCards left: ${deck.cardCount}`,
            "info",
            interaction.user,
            true,
            [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Draw again?")
                        .setCustomId(`drawCard_${interaction.id}`)
                        .setStyle(ButtonStyle.Primary)
                ),
            ]
        );
    }
);

enum BlackjackPhase {
    "UserDrawing",
    "DealerDrawing",
    "Done",
}
class BlackjackGame {
    private deck: Deck;
    private stake: number;
    private phase: BlackjackPhase = BlackjackPhase.UserDrawing;
    public DealerCards: Card[] = [];
    public UserCards: Card[] = [];
    interaction: ChatInputCommandInteraction;
    public initializeTime: Date;
    constructor(interaction: ChatInputCommandInteraction, stake: number) {
        this.interaction = interaction;
        this.initializeTime = new Date();
        this.stake = stake;
        this.deck = new Deck();
        this.deck.shuffle().shuffle(); // extra shuffles for extra randomness
        // setup user and dealer cards one by one, like in real play
        for (let i = 0; i < 2; i++) {
            this.DealerCards.push(this.deck.drawCard());
            this.UserCards.push(this.deck.drawCard());
        }
        void this.updateGameState();
    }

    private calculateScore(cards: Card[]): number {
        let score = 0;
        let aceCount = 0;
        // assume aces as 1s first
        cards.forEach((card) => {
            switch (card.value) {
                case "J":
                case "Q":
                case "K":
                    score += 10;
                    break;
                case "A":
                    score += 1;
                    aceCount += 1;
                    break;
                default:
                    score += parseInt(card.value);
            }
        });
        // score is definitely higher than 21 - return fail state
        if (score > 21) return score;
        // is there an ace and room for 10 additional points? add the ace as an 11
        // there can't be two 11-aces - that would already be 22 > 21!
        if (score <= 11 && aceCount > 0) {
            score += 10;
            aceCount--;
        }
        return score;
    }

    private isBlackjack(cards: Card[]) {
        return this.calculateScore(cards) === 21 && cards.length === 2;
    }

    private async canAffordDoubleDown() {
        return (
            (await DataStorage.getUserBalance(this.interaction.user.id)) >=
            this.stake
        );
    }

    public get DealerScore(): number {
        if (this.phase === BlackjackPhase.UserDrawing) {
            // only calculating the first card
            return this.calculateScore(this.DealerCards.slice(0, 1));
        } else {
            return this.calculateScore(this.DealerCards);
        }
    }

    public get UserScore(): number {
        return this.calculateScore(this.UserCards);
    }

    private async renderHands(hideDealerCard = false): Promise<void> {
        const dealerShownHand = hideDealerCard
            ? this.DealerCards.slice(0, 1)
            : this.DealerCards;
        console.log(
            await BrowserRenderer.getInstance().renderBlackjack(
                this.interaction.id,
                this.UserCards,
                dealerShownHand,
                this.UserScore,
                this.DealerScore
            )
        );
    }

    private printHands(hideDealerCard = false): string {
        const dealerShownHand = hideDealerCard
            ? this.DealerCards.slice(0, 1)
            : this.DealerCards;
        return `\n**Dealer's hand**\n
        ${
            dealerShownHand.map((card) => card.toString()).join(" ") +
            (hideDealerCard ? " ??" : "")
        } (${this.DealerScore})
        \n
        **Your hand**\n
        ${this.UserCards.map((card) => card.toString()).join(" ")} (${
            this.UserScore
        })`;
    }

    private drawAsDealer() {
        while (this.DealerScore < 17) {
            this.DealerCards.push(this.deck.drawCard());
        }
        this.phase = BlackjackPhase.Done;
        void this.updateGameState();
    }

    // user interactions
    public async userHit() {
        this.UserCards.push(this.deck.drawCard());
        await this.updateGameState();
    }
    public async userStand() {
        this.phase = BlackjackPhase.DealerDrawing;
        await this.updateGameState();
    }
    public async userDoubleDown() {
        // remove 2nd set of stake first
        await DataStorage.subtractUserBalance(
            this.interaction.user.id,
            this.stake
        );
        // ...and then update the stake to be double
        this.stake = this.stake * 2;
        this.UserCards.push(this.deck.drawCard());
        this.phase = BlackjackPhase.DealerDrawing;
        await this.updateGameState();
    }

    private get UserBlackjack() {
        return this.isBlackjack(this.UserCards);
    }
    private get UserBust() {
        return this.UserScore > 21;
    }
    private get DealerBust() {
        return this.DealerScore > 21;
    }
    private get UserWins() {
        return (
            !this.UserBust &&
            (this.UserScore > this.DealerScore || this.DealerBust)
        );
    }
    private get Tied() {
        return !this.UserBust && this.UserScore === this.DealerScore;
    }
    private get UserLost() {
        return (
            (!this.DealerBust && this.DealerScore > this.UserScore) ||
            this.UserBust
        );
    }

    public async updateMessage() {
        let description: string = "Something went terribly wrong...";
        let buttons: unknown[] = []; // still need to figure out which type this is
        const canAffordDouble = await this.canAffordDoubleDown();
        void this.renderHands(); // todo: move this to the proper position and incorporate it in message renders
        switch (this.phase) {
            case BlackjackPhase.UserDrawing:
                // add interaction buttons
                const buttonList = [
                    new ButtonBuilder()
                        .setLabel("Hit")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`blackjack_${this.interaction.id}_hit`),
                    new ButtonBuilder()
                        .setLabel("Stand")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`blackjack_${this.interaction.id}_stand`),
                ];
                if (this.UserCards.length <= 2) {
                    buttonList.push(
                        new ButtonBuilder()
                            .setLabel("Double Down")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(
                                `blackjack_${this.interaction.id}_double`
                            )
                            .setDisabled(!canAffordDouble)
                    );
                }
                description = `It's your turn.\n${this.printHands(true)}`;
                buttons = [new ActionRowBuilder().addComponents(buttonList)];
                break;
            case BlackjackPhase.DealerDrawing:
                description = `Dealer is drawing.\n${this.printHands()}`;
                break;
            case BlackjackPhase.Done:
                if (this.UserBlackjack) {
                    description = `**BLACKJACK! Pays out 3:2.**
                    ${this.stake} => ${this.stake * 2.5} 🪙.
                    ${this.printHands()}`;
                } else if (this.UserWins) {
                    description = `**You win!**
                    ${this.stake} => ${this.stake * 2} 🪙.
                    ${this.printHands()}`;
                } else if (this.Tied) {
                    description = `**It's a tie.**
                    ${this.stake} => ${this.stake} 🪙.
                    ${this.printHands()}`;
                } else if (this.UserBust) {
                    description = `**You went bust.**
                    ${this.stake} => 0 🪙.
                    ${this.printHands()}`;
                } else if (this.UserLost) {
                    description = `**You lost.**
                    ${this.stake} => 0 🪙.
                    ${this.printHands()}`;
                } else {
                    throw new Error("Blackjack - how did we even get here?");
                }
                break;
        }
        void replyWithEmbed(
            this.interaction,
            "Blackjack",
            description,
            "info",
            this.interaction.user,
            true,
            buttons.length > 0 ? buttons : [],
            new URL(
                "https://cdn.discordapp.com/emojis/857695793090527254.gif?size=96&quality=lossless"
            ) // TODO - this will replace the print-cards thing once I've figured out GraphicsMagick.
        );
    }

    public async updateGameState() {
        try {
            switch (this.phase) {
                case BlackjackPhase.UserDrawing:
                    if (
                        this.UserBlackjack ||
                        this.UserBust ||
                        this.UserScore === 21
                    ) {
                        // forcefully proceed to "done" state - user has confirmed won or lost
                        this.phase = BlackjackPhase.Done;
                        await this.updateGameState();
                    }
                    break;
                case BlackjackPhase.DealerDrawing:
                    setTimeout(this.drawAsDealer.bind(this), 2500); // make the dealer draw in 2.5 seconds for suspense
                    break;
                case BlackjackPhase.Done:
                    if (this.UserBlackjack) {
                        // pay out 3:2
                        await DataStorage.addUserBalance(
                            this.interaction.user.id,
                            this.stake * 2.5
                        );
                    } else if (this.UserWins) {
                        // pay out 1:1
                        await DataStorage.addUserBalance(
                            this.interaction.user.id,
                            this.stake * 2
                        );
                    } else if (this.Tied) {
                        // return the stake
                        await DataStorage.addUserBalance(
                            this.interaction.user.id,
                            this.stake
                        );
                    }
                    break;
            }
            await this.updateMessage();
        } catch (e) {
            console.error(
                "Something went wrong while updating the Blackjack game state:",
                e
            );
            // refund stake
            await DataStorage.addUserBalance(
                this.interaction.user.id,
                this.stake
            );
            // report game as borked
            void replyWithEmbed(
                this.interaction,
                "Blackjack",
                "Something went wrong... The game has been cancelled and your stake has been refunded.",
                "error",
                this.interaction.user,
                true
            );
        }
    }
}

const BlackjackInteractionTypes = ["hit", "stand", "double"];

export class BlackjackStorage {
    static instance: BlackjackStorage;
    private constructor() {
        this.games = [];
        setInterval(this.cleanupTask.bind(this), 60000); // once every minute
    }
    public static getInstance() {
        if (!BlackjackStorage.instance)
            BlackjackStorage.instance = new BlackjackStorage();
        return BlackjackStorage.instance;
    }

    private games: BlackjackGame[] = [];

    private deleteGame(interactionID: Snowflake) {
        this.games = this.games.filter(
            (game) => game.interaction.id !== interactionID
        );
    }

    public cleanupTask() {
        this.games.forEach((game) => {
            if (game.initializeTime.getTime() + 600000 <= Date.now()) {
                this.deleteGame(game.interaction.id);
            }
        });
    }

    public createGame(interaction, stake) {
        this.games.push(new BlackjackGame(interaction, stake));
    }

    public async handleInteraction(buttonInteraction: ButtonInteraction) {
        if (!buttonInteraction.customId.startsWith("blackjack")) {
            console.error(
                `Interaction ${buttonInteraction.customId} wrongly given to blackjack handler, ignoring.`
            );
            return;
        }
        const [_prefix, gameId, gameAction] =
            buttonInteraction.customId.split("_");
        const foundGame = this.games.find(
            (game) => game.interaction.id === gameId
        );
        if (
            foundGame == undefined ||
            gameAction == undefined ||
            !BlackjackInteractionTypes.includes(gameAction)
        ) {
            void replyWithEmbed(
                buttonInteraction,
                "Blackjack",
                "This interaction seems invalid.",
                "error",
                buttonInteraction.user,
                true
            );
            return;
        }
        await buttonInteraction.deferUpdate();
        switch (gameAction) {
            case "hit":
                void foundGame.userHit();
                break;
            case "stand":
                void foundGame.userStand();
                break;
            case "double":
                void foundGame.userDoubleDown();
                break;
        }
    }
}

export const blackjack = new Command(
    "blackjack",
    'Play Blackjack ("Siebzehn und Vier") against the computer with "real" card decks!',
    async (interaction) => {
        const stake = getValidStake(
            interaction,
            interaction.options.getNumber("stake")
        );
        if (stake === 0) return;
        try {
            await interaction.deferReply({ ephemeral: true });
            await DataStorage.subtractUserBalance(interaction.user.id, stake);
            BlackjackStorage.getInstance().createGame(interaction, stake);
        } catch (e) {
            if (e instanceof InsufficientBalanceError) {
                void replyWithEmbed(
                    interaction,
                    "Insufficient balance",
                    "You can't stake 🪙 you don't have!",
                    "warn",
                    interaction.user,
                    true
                );
            } else {
                throw e;
            }
        }
    },
    [
        {
            name: "stake",
            type: "Number",
            description: "The amount of 🪙 to stake.",
            required: true,
        },
    ]
);
