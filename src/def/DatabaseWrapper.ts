import { Database, open as dbOpen } from "sqlite";
import sqlite3 from "sqlite3";
import { Snowflake } from "discord.js";
import * as fs from "fs";
import { Item, ItemData, ItemType } from "./Item.js";
import { getDayDifference } from "./DateDifference.js";

export class DatabaseError extends Error {}
export class InsufficientBalanceError extends Error {}

// TODO: Extract these values into easily configurable settings
const payoutMultipliers = [2, 3, 4, 5, 6, 8, 10];
const dailyCredits = 5;
const initialBank = 200;
const birthdayCredits = 400;

export class DatabaseWrapper {
    private static instance: DatabaseWrapper;
    private static ready: boolean = false;
    private database: Database;
    async setupDatabase(): Promise<void> {
        this.database = await dbOpen({
            filename: "./database.db",
            driver: sqlite3.Database,
        });
        await this.createTablesIfNonExistent();

        DatabaseWrapper.ready = true;
    }

    private async createTablesIfNonExistent(): Promise<void> {
        fs.readFile(
            "./src/sql/createTables.sql",
            { encoding: "utf-8" },
            (err, data) => {
                if (err)
                    throw new DatabaseError("Couldn't create/verify tables.", {
                        cause: err,
                    });
                if (data) {
                    // split the queries on the semicolons, and then add them back onto trimmed commands
                    const sqlQueries = data
                        .split(";")
                        .map((command) => command.trim() + ";");
                    sqlQueries.forEach(async (query) => {
                        await this.database
                            .exec(query)
                            .catch(
                                (err) =>
                                    new DatabaseError(
                                        "Couldn't create a table during setup",
                                        { cause: err }
                                    )
                            );
                    });
                }
            }
        );
    }

    private constructor() {
        // intentional no-op to implement singleton behaviour
    }
    public static getInstance() {
        if (!DatabaseWrapper.instance)
            DatabaseWrapper.instance = new DatabaseWrapper();

        if (!DatabaseWrapper.ready) {
            void DatabaseWrapper.instance.setupDatabase();
        }
        return DatabaseWrapper.instance;
    }

    /**
     * Throws a {@link DatabaseError} if the databaseSetup has not finished.
     * @private
     */
    private assertReady() {
        if (!DatabaseWrapper.ready)
            throw new DatabaseError("Database is not ready.");
    }

    // =============
    // Bank / Balance related queries
    // =============

    private async createUserBankEntry(userID: Snowflake, balance = 0) {
        await this.database.exec(
            `INSERT INTO Bank (userID, balance) VALUES ("${userID}", ${balance})`
        );
    }

    public async getUserBalance(userID: Snowflake): Promise<number> {
        this.assertReady();
        const res = await this.database.get(
            `SELECT balance FROM Bank WHERE userID = "${userID}"`
        );
        // User bank entry does not exist
        if (res === undefined) {
            await this.createUserBankEntry(userID, initialBank);
            return initialBank;
        } else {
            return res.balance as number;
        }
    }

    public async setUserBalance(
        userID: Snowflake,
        amount: number
    ): Promise<number> {
        this.assertReady();
        await this.database.exec(
            `INSERT OR REPLACE INTO Bank (userID, balance) VALUES ("${userID}", ${amount});`
        );
        return amount;
    }

    public async addUserBalance(
        userID: Snowflake,
        amount: number
    ): Promise<number> {
        this.assertReady();
        const newBalance = (await this.getUserBalance(userID)) + amount;
        return this.setUserBalance(userID, newBalance);
    }

    /**
     * Reduces a users balance by the given amount.
     * @returns {@link number}: New user balance.
     * @throws {@link InsufficientBalanceError} if targeted userID balance is less than the desired reduction amount.
     * @param userID {@link Snowflake}: The Discord User ID/Snowflake to target
     * @param amount {@link number}: Amount to subtract from balance.
     */
    public async subtractUserBalance(
        userID: Snowflake,
        amount: number
    ): Promise<number> {
        this.assertReady();
        const newBalance = (await this.getUserBalance(userID)) - amount;
        if (newBalance < 0)
            throw new InsufficientBalanceError(
                `Cannot subtract ${amount} from ${userID}, would be negative (${newBalance})`
            );
        return this.setUserBalance(userID, newBalance);
    }

    // =============
    // Item stock / shop related queries
    // =============

    public async listAllShopItems(items = [], offset = 0): Promise<Item[]> {
        this.assertReady();
        const limit = 100;
        const dbResponse = await this.listShopItems(limit, offset);
        const response = items.concat(dbResponse);
        if (dbResponse.length >= limit) {
            return await this.listAllShopItems(response, offset + limit);
        } else {
            return response;
        }
    }

    public async listUnownedItems(userID: Snowflake): Promise<Item[]> {
        this.assertReady();
        const dbResponse = await this.database.all(
            `SELECT * from Shop WHERE NOT EXISTS (SELECT itemID FROM Inventory WHERE Inventory.userID = "${userID}" AND Inventory.itemID = Shop.itemID);`
        );
        return dbResponse.map((row) => Item.createFromDBResponse(row));
    }

    /**
     * Lists (at most) `count` shop items, starting with item `offset`.
     * @param limit Defaults to 100 - constrained to database limitations.
     * @param offset
     * @returns
     */
    public async listShopItems(limit = 100, offset = 0): Promise<Item[]> {
        this.assertReady();
        const response = await this.database.all(
            `SELECT * FROM Shop ORDER BY itemName LIMIT ${limit} OFFSET ${offset};`
        );
        if (!response)
            throw new DatabaseError(
                "No data was returned while querying all items."
            );
        return response.map((row) => Item.createFromDBResponse(row)); // todo: do stuff with the response to conform to the Item definition
    }

    public async createShopItem(
        itemName: string,
        itemType: ItemType,
        itemData: ItemData,
        value: number
    ) {
        this.assertReady();
        console.log(JSON.stringify(itemData));
        if (value < 0)
            throw new RangeError("Shop items must not have a negative price.");
        await this.database.exec(
            `INSERT INTO Shop (itemName, itemType, itemData, value) VALUES ("${itemName}", "${itemType}", '${JSON.stringify(
                itemData
            )}', ${value});`
        );
    }

    public async getShopItem(itemID: number): Promise<Item | false> {
        this.assertReady();
        const foundItem = await this.database.get(
            `SELECT * FROM Shop WHERE itemID = ${itemID};`
        );
        if (foundItem) return Item.createFromDBResponse(foundItem);
        else return false;
    }

    public async searchShopItem(itemName: string): Promise<Item | false> {
        this.assertReady();
        const foundItem = await this.database.get(
            `SELECT * FROM Shop WHERE itemName = "${itemName}"`
        );
        if (foundItem) return Item.createFromDBResponse(foundItem);
        else return false;
    }

    public async removeShopItem(itemID: number) {
        this.assertReady();
        await this.database.exec(`DELETE FROM Shop WHERE itemID = ${itemID};`);
    }

    // =============
    // Inventory / user ownership related queries
    // =============

    public async listOwnedItems(userID: Snowflake): Promise<Item[]> {
        this.assertReady();
        const dbResponse = await this.database
            .all(`SELECT Shop.itemName, Shop.itemType, Shop.itemData, Shop.itemID
            FROM Shop INNER JOIN Inventory ON Shop.itemID = Inventory.itemID
            WHERE userID = "${userID}";`);
        return dbResponse.map((row) => Item.createFromDBResponse(row));
    }

    /**
     * Creates an inventory record to assign a user an item.
     * Note: This does not respect the value and balance of the targeted item. Balance checks etc. have to be done seperately.
     */
    public async giveUserItem(userID: Snowflake, itemID: number) {
        this.assertReady();
        // TODO: maybe modify this or the database such that duplicate itemID/userID pairs get rejected
        await this.database.exec(
            `INSERT INTO Inventory (itemID, userID) VALUES (${itemID}, "${userID}");`
        );
    }

    public async removeUserItem(userID: Snowflake, itemID: number) {
        this.assertReady();
        await this.database.exec(
            `DELETE FROM Inventory WHERE itemID = ${itemID} AND userID = "${userID}";`
        );
    }
    public async checkItemOwnership(
        userID: Snowflake,
        itemID: number
    ): Promise<boolean> {
        this.assertReady();
        const response = await this.database.get(`SELECT COUNT(Shop.itemName)
            FROM Shop INNER JOIN Inventory ON Shop.itemID = Inventory.itemID
            WHERE userID = "${userID}" AND Inventory.itemID = ${itemID}`);
        return response["COUNT(Shop.itemName)"] >= 1;
    }

    // =============
    // Daily credits / streak related
    // =============
    public async claimDailyCredits(
        userID: Snowflake
    ): Promise<DailyCreditsResponse> {
        this.assertReady();
        const dbResponse = await this.database.get(
            `SELECT lastClaimed, streak FROM Streaks WHERE userID = "${userID}";`
        );
        const now = new Date();
        let lastClaim: Date;
        let dayDifference: number;
        if (dbResponse !== undefined) {
            lastClaim = new Date(dbResponse.lastClaimed);
            dayDifference = getDayDifference(lastClaim, now);
            if (dayDifference <= 0) {
                return {
                    received: 0,
                    lastClaimed: lastClaim,
                    streak: dbResponse.streak,
                    isBirthday: false,
                    userAge: null,
                };
            }
        } else {
            // todo: this is marked as unused. uh oh.
            lastClaim = new Date(0);
            dayDifference = Infinity;
        }
        // establish new streak value
        let streak = dbResponse?.streak ?? 0;
        if (dayDifference < 2) streak += 1;
        else streak = 1;
        // make the daily query check the birthday - if it's set, check if the current day & month match.
        const birthdayDbResponse = await this.getBirthday(userID);
        const isBirthday =
            birthdayDbResponse &&
            birthdayDbResponse.day === now.getDate() &&
            birthdayDbResponse.month === now.getMonth() + 1;
        const userAge =
            birthdayDbResponse && birthdayDbResponse.year
                ? now.getFullYear() - birthdayDbResponse.year
                : null;

        // add currency based on payouts table - if birthday, give flat amount. streak resets after full cycle.
        const currencyToAdd = isBirthday
            ? birthdayCredits
            : payoutMultipliers[(streak - 1) % 7] * dailyCredits;
        // give credits
        await this.addUserBalance(userID, currencyToAdd);
        // set new streak value in DB
        await this.database.exec(
            `INSERT OR REPLACE INTO Streaks (userID, lastClaimed, streak) VALUES ("${userID}", "${now.toISOString()}" ,${streak});`
        );
        // create response object
        return {
            lastClaimed: now,
            received: currencyToAdd,
            streak: streak,
            isBirthday: isBirthday,
            userAge: userAge,
        };
    }

    public async setBirthday(
        userID: Snowflake,
        day: number,
        month: number,
        year?: number
    ) {
        this.assertReady();
        await this.database.exec(
            `INSERT OR REPLACE INTO Birthdays (userID, day, month, year) VALUES ("${userID}", ${day}, ${month}, ${
                year ?? "NULL"
            });`
        );
    }

    public async getBirthday(
        userID: Snowflake
    ): Promise<BirthdayResponse | null> {
        this.assertReady();
        const dbResponse = await this.database.get(
            `SELECT day, month, year FROM Birthdays WHERE userID = "${userID}";`
        );
        if (dbResponse === undefined) return null;
        return {
            day: dbResponse.day,
            month: dbResponse.month,
            year: dbResponse.year ?? null,
        };
    }
}
type DailyCreditsResponse = {
    received: number; // 0 if none received, any positive value otherwise
    streak: number;
    lastClaimed: Date; // date of last claim - if just claimed, current time.
    isBirthday: boolean;
    userAge: number | null;
};

type BirthdayResponse = {
    day: number;
    month: number;
    year: number | null;
};

export const DataStorage = DatabaseWrapper.getInstance();
// Should in theory always perform the setup
