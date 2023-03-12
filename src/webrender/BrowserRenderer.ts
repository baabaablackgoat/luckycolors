import puppeteer from "puppeteer";
import * as fs from "fs";
import { Snowflake } from "discord.js";
import { Card } from "../def/Deck";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blackjackTemplate = fs.readFileSync(
    "./src/webrender/blackjack.html",
    "utf-8"
);
export class BrowserRenderer {
    private static instance: BrowserRenderer;
    private constructor() {
        void this.setup();
    }
    private async setup() {
        this.browser = await puppeteer.launch({
            headless: true,
        });
        this.page = await this.browser.newPage("file://blank.html");
        await this.page.setViewport({
            width: 600,
            height: 500,
            deviceScaleFactor: 1,
        });
        this.ready = true;
    }
    public static getInstance(): BrowserRenderer {
        if (!BrowserRenderer.instance)
            BrowserRenderer.instance = new BrowserRenderer();
        return BrowserRenderer.instance;
    }
    private browser;
    private page;
    public ready: boolean = false;

    /**
     * Returns the file URL that was generated.
     */
    public async renderBlackjack(
        interactionID: Snowflake,
        userCards: Card[],
        dealerCards: Card[],
        userScore: number,
        dealerScore: number
    ): Promise<string> {
        if (!this.ready) throw new Error("not ready"); // todo make better error
        let userCardsHTML = "";
        userCards.forEach((card) => (userCardsHTML += card.toHtml()));
        let dealerCardsHTML = "";
        dealerCards.forEach((card) => (dealerCardsHTML += card.toHtml()));
        const blackjackContent = blackjackTemplate
            .replace("$userCards", userCardsHTML)
            .replace("$dealerCards", dealerCardsHTML)
            .replace("$userScore", userScore.toString())
            .replace("$dealerScore", dealerScore.toString());
        fs.writeFileSync(
            `./out/blackjack/${interactionID}.html`,
            blackjackContent
        );
        await this.page.goto(
            `file://${__dirname}/../../out/blackjack/${interactionID}.html`
        );

        const pngOutPath = `./out/blackjack/${interactionID}.png`;
        await this.page.screenshot({ path: pngOutPath });
        return pngOutPath;
    }
}
