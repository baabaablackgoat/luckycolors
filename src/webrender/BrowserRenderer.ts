import puppeteer from "puppeteer";
import * as fs from "fs";
import { Snowflake } from "discord.js";
import { Card } from "../def/Deck";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
    getExistingSlotsSymbols,
    SlotSymbol,
} from "../commands/SlotsCommands.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blackjackTemplate = fs.readFileSync(
    "./src/webrender/blackjack.html",
    "utf-8"
);
const slotsTemplate = fs.readFileSync("./src/webrender/slots.html", "utf-8");

export class BrowserRenderer {
    private static instance: BrowserRenderer;

    private static blackjackDir = "out/blackjack";
    private static slotsDir = "out/slots";
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
        if (!BrowserRenderer.instance) {
            // Assume this is the first run - clean up all previously rendered files.
            BrowserRenderer.instance = new BrowserRenderer();
            BrowserRenderer.initialCleanup();
        }
        return BrowserRenderer.instance;
    }

    private static initialCleanup() {
        // clean out all known render directories
        fs.readdir(`./${BrowserRenderer.blackjackDir}`, (err, files) => {
            if (err)
                console.error(
                    "Couldn't perform initial cleanup task for blackjack:",
                    err
                );
            files.forEach((fileName) => {
                if (fileName.endsWith(".html") || fileName.endsWith(".png")) {
                    const filePath = `./${BrowserRenderer.blackjackDir}/${fileName}`;
                    console.log("Cleaning up leftover file: ", filePath);
                    fs.unlink(filePath, (err) => {
                        if (err)
                            console.error(
                                `Initial cleanup attempted to cleanup file ${filePath} but failed:`,
                                err
                            );
                    });
                }
            });
        });
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
            `./${BrowserRenderer.blackjackDir}/${interactionID}.html`,
            blackjackContent
        );
        await this.page.goto(
            `file://${__dirname}/../../${BrowserRenderer.blackjackDir}/${interactionID}.html`
        );

        const pngOutPath = `./${BrowserRenderer.blackjackDir}/${interactionID}.png`;
        await this.page.screenshot({ path: pngOutPath });
        return pngOutPath;
    }

    public async cleanupBlackjack(interactionID: Snowflake) {
        fs.unlink(
            `./${BrowserRenderer.blackjackDir}/${interactionID}.html`,
            (err) => {
                if (err)
                    console.warn(
                        `Couldn't delete HTML file for Blackjack game ${interactionID}`,
                        err
                    );
            }
        );
        fs.unlink(
            `./${BrowserRenderer.blackjackDir}/${interactionID}.png`,
            (err) => {
                if (err)
                    console.warn(
                        `Couldn't delete screenshot for Blackjack game ${interactionID}`,
                        err
                    );
            }
        );
    }

    public async cleanupSlots(interactionID: Snowflake) {
        fs.unlink(
            `./${BrowserRenderer.slotsDir}/${interactionID}.html`,
            (err) => {
                if (err)
                    console.warn(
                        `Couldn't delete HTML file for Slots game ${interactionID}`,
                        err
                    );
            }
        );
        fs.unlink(
            `./${BrowserRenderer.slotsDir}/${interactionID}.png`,
            (err) => {
                if (err)
                    console.warn(
                        `Couldn't delete screenshot for Slots game ${interactionID}`,
                        err
                    );
            }
        );
    }

    public async renderSlots(
        interactionID: Snowflake,
        symbols: Array<SlotSymbol>
    ): Promise<string> {
        if (!this.ready) throw new Error("not ready"); // todo make better error
        let slotsContent = slotsTemplate;
        const slotsSymbols = getExistingSlotsSymbols();
        const symbolProxy = new Proxy(slotsSymbols, {
            get(target, prop) {
                if (typeof prop === "symbol")
                    throw new Error(
                        "weird attempt at accessing slotsymbols with a symbol"
                    );
                let targetIndex = parseInt(prop);
                if (isNaN(targetIndex))
                    throw new Error("slotsSymbol index was NaN");
                if (targetIndex < 0) targetIndex += target.length;
                return target[targetIndex % target.length];
            },
        });
        for (let wheel = 0; wheel < 3; wheel++) {
            const symbolIndex = slotsSymbols.indexOf(symbols[wheel]);
            slotsContent = slotsContent
                .replace(
                    `$imagePlaceholder${wheel * 3}`,
                    symbolProxy[symbolIndex - 1].symbol
                )
                .replace(
                    `$imagePlaceholder${wheel * 3 + 1}`,
                    symbolProxy[symbolIndex].symbol
                )
                .replace(
                    `$imagePlaceholder${wheel * 3 + 2}`,
                    symbolProxy[symbolIndex + 1].symbol
                );
        }
        fs.writeFileSync(
            `./${BrowserRenderer.slotsDir}/${interactionID}.html`,
            slotsContent
        );
        await this.page.goto(
            `file://${__dirname}/../../${BrowserRenderer.slotsDir}/${interactionID}.html`
        );
        const pngOutPath = `./${BrowserRenderer.slotsDir}/${interactionID}.png`;
        await this.page.screenshot({ path: pngOutPath });
        return pngOutPath;
    }
}
