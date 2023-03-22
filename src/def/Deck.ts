import { Snowflake } from "discord.js";

const suits = ["Hearts", "Spades", "Diamonds", "Clubs"] as const;
const cardValues = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
] as const;
type Suit = (typeof suits)[number];
type CardValue = (typeof cardValues)[number];
export class Card {
    suit: Suit;
    value: CardValue;
    hidden: boolean = false;
    constructor(suit: Suit, value: CardValue, hidden = false) {
        this.suit = suit;
        this.value = value;
        this.hidden = hidden;
    }
    toString(): string {
        let output = "";
        switch (this.suit) {
            case "Hearts":
                output += "♥";
                break;
            case "Diamonds":
                output += "♦";
                break;
            case "Clubs":
                output += "♣";
                break;
            case "Spades":
                output += "♠";
                break;
        }
        output += this.value;
        return output;
    }
    // used in the web renderer!
    toHtml(): string {
        if (this.hidden)
            return `<div class="card"><img src="../../src/webrender/fnv_cards/card_back.png" alt="card back"></div>`;

        return `<div class="card"><img src="../../src/webrender/fnv_cards/${
            this.value
        }_of_${this.suit}.webp" alt="${this.toString()}"></div>`;
    }
}

type DeckType = "Skat" | "Full";

export class Deck {
    deckCount: number;
    deckType: DeckType;
    stack: Card[] = [];

    // Define a default "sorted" card stack.
    static CardSet(deckType: DeckType = "Full"): Card[] {
        const fullSet: Card[] = [];
        suits.forEach((suit) => {
            switch (deckType) {
                case "Full":
                    cardValues.forEach((cardValue) => {
                        fullSet.push(new Card(suit, cardValue));
                    });
                    break;
                case "Skat":
                    cardValues.slice(5).forEach((cardValue) => {
                        fullSet.push(new Card(suit, cardValue));
                    });
                    break;
            }
        });
        return fullSet;
    }

    constructor(deckType: DeckType = "Full", deckCount = 1) {
        this.deckCount = deckCount;
        this.deckType = deckType;
        this.resetDeck();
        this.shuffle();
    }
    resetDeck() {
        this.stack = [];
        for (let i = 0; i < this.deckCount; i++) {
            this.stack = this.stack.concat(Deck.CardSet(this.deckType));
        }
        this.shuffle();
    }
    shuffle() {
        this.stack = this.stack.sort((_a, _b) => 0.5 - Math.random());
        return this;
    }
    drawCard(): Card {
        if (this.stack.length === 0) this.resetDeck();
        return this.stack.shift();
    }
    public get cardCount() {
        return this.stack.length;
    }
}

interface IStoredDeck {
    createdAt: Date;
    deck: Deck;
    id: Snowflake;
}

export class DeckStorage {
    private static instance: DeckStorage;
    decks: IStoredDeck[];
    private constructor() {
        this.decks = [];
        // clean up unused decks every minute
        setInterval(this.cleanupDecks.bind(this), 60000);
    }
    public static getInstance(): DeckStorage {
        if (DeckStorage.instance === undefined)
            DeckStorage.instance = new DeckStorage();
        return DeckStorage.instance;
    }
    public getDeck(id: Snowflake): Deck | undefined {
        const foundDeck = this.decks.find((storedDeck) => storedDeck.id == id);
        return foundDeck ? foundDeck.deck : undefined;
    }
    public createDeck(
        id: Snowflake,
        deckType: DeckType = "Full",
        deckCount = 1
    ): Deck {
        if (this.getDeck(id)) this.deleteDeck(id);
        const newDeck = new Deck(deckType, deckCount);
        this.decks.push({
            createdAt: new Date(),
            deck: newDeck,
            id: id,
        });
        return newDeck;
    }

    public deleteDeck(id: Snowflake): void {
        this.decks = this.decks.filter((storedDeck) => storedDeck.id !== id);
    }

    private cleanupDecks() {
        this.decks.forEach((deck) => {
            if (Date.now() - deck.createdAt.getTime() > 1800000) {
                console.log("Removing old deck:", deck.id);
                this.deleteDeck(deck.id);
            }
        });
    }
}
