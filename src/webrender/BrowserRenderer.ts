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
import {
    BuckshotItem,
    BuckshotGame,
    BuckshotPhase,
} from "../commands/BuckshotCommands.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blackjackTemplate = fs.readFileSync(
    "./src/webrender/blackjack.html",
    "utf-8"
);
const slotsTemplate = fs.readFileSync("./src/webrender/slots.html", "utf-8");

const buckshotTemplate = fs.readFileSync(
    "./src/webrender/buckshot.html",
    "utf-8"
);

export class BrowserRenderer {
    private static instance: BrowserRenderer;

    private static blackjackDir = "out/blackjack";
    private static slotsDir = "out/slots";
    private static buckshotDir = "out/buckshot";
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
        // this is terrible but i'm also lazy
        [
            BrowserRenderer.blackjackDir,
            BrowserRenderer.slotsDir,
            BrowserRenderer.buckshotDir,
        ].forEach((targetDir) => {
            fs.readdir(`./${targetDir}`, (err, files) => {
                if (err)
                    console.error(
                        `Couldn't perform initial cleanup task for ${targetDir}:`,
                        err
                    );
                files.forEach((fileName) => {
                    if (
                        fileName.endsWith(".html") ||
                        fileName.endsWith(".png")
                    ) {
                        const filePath = `./${targetDir}/${fileName}`;
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

    private async cleanupRenderFiles(
        directory: string,
        interactionID: Snowflake
    ) {
        const htmlPath = `./${directory}/${interactionID}.html`;
        const pngPath = `./${directory}/${interactionID}.png`;
        fs.unlink(htmlPath, (err) => {
            if (err) console.warn(`Couldn't delete raw HTML ${htmlPath}`, err);
        });
        fs.unlink(pngPath, (err) => {
            if (err) console.warn(`Couldn't delete screenshot ${pngPath}`, err);
        });
    }

    public async cleanupBlackjack(interactionID: Snowflake) {
        await this.cleanupRenderFiles(
            BrowserRenderer.blackjackDir,
            interactionID
        );
    }

    public async cleanupSlots(interactionID: Snowflake) {
        await this.cleanupRenderFiles(BrowserRenderer.slotsDir, interactionID);
    }

    public async cleanupBuckshot(interactionID: Snowflake) {
        await this.cleanupRenderFiles(
            BrowserRenderer.buckshotDir,
            interactionID
        );
    }

    public async renderSlots(
        interactionID: Snowflake,
        symbols: Array<SlotSymbol>,
        outcome: string
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
        slotsContent = slotsContent.replace("$outcome", outcome);
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

    public async renderBuckshot(interactionID: Snowflake, game: BuckshotGame) {
        function shellReplacer(value: undefined | boolean) {
            switch (value) {
                case undefined:
                    return "";
                case true:
                    return "live";
                case false:
                    return "blank";
            }
        }

        function itemReplacer(value: undefined | BuckshotItem) {
            switch (value) {
                // todo: replace with actual images
                case BuckshotItem.Saw:
                    return `<img src="slots/fries.png">`;
                case BuckshotItem.Handcuffs:
                    return `<img src="slots/boba.png">`;
                case BuckshotItem.Cigarettes:
                    return `<img src="slots/hamburger.png">`;
                case BuckshotItem.Magnifier:
                    return `<img src="slots/pancakes.png">`;
                case BuckshotItem.Beer:
                    return `<img src="slots/pizza.png">`;
                case undefined:
                    return "";
            }
        }

        if (!this.ready) throw new Error("not ready"); // todo make better error
        let buckshotContent = buckshotTemplate;
        let fakeShells: Array<boolean> = [];
        if (game.turnPhase == BuckshotPhase.Reloading) {
            fakeShells = [
                ...Array(game.shotgun.chamber.insertedTotal).keys(),
            ].map((i) => i < game.shotgun.chamber.insertedLive);
        }
        for (let i = 0; i < 8; i++) {
            buckshotContent.replace(
                `$shotClass${i}`,
                shellReplacer(fakeShells[i])
            );
        }
        // todo: replace with actual image
        const healthElement = `<img src="slots/fries.png" />`;
        buckshotContent.replace(
            "$dealerHealth",
            healthElement.repeat(game.dealer.health)
        );
        buckshotContent.replace(
            "$playerHealth",
            healthElement.repeat(game.player.health)
        );
        for (let i = 0; i < 8; i++) {
            buckshotContent.replace(
                `$dealerItem${i}`,
                itemReplacer(game.dealer.inventory[i])
            );
        }
        for (let i = 0; i < 8; i++) {
            buckshotContent.replace(
                `$playerItem${i}`,
                itemReplacer(game.player.inventory[i])
            );
        }

        fs.writeFileSync(
            `./${BrowserRenderer.buckshotDir}/${interactionID}.html`,
            buckshotContent
        );
        await this.page.goto(
            `file://${__dirname}/../../${BrowserRenderer.buckshotDir}/${interactionID}.html`
        );
        const pngOutPath = `./${BrowserRenderer.buckshotDir}/${interactionID}.png`;
        await this.page.screenshot({ path: pngOutPath });
        return pngOutPath;
    }
}
