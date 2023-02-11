import { Database, open as dbOpen } from "sqlite";
import sqlite3 from "sqlite3";
import { Snowflake } from "discord.js";
import * as fs from "fs";
import {ItemData, ItemType} from "./Item";

class DatabaseError extends Error {}
class InsufficientBalanceError extends Error {}

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

    public async checkUserBalance(userID: Snowflake): Promise<number> {
        this.assertReady();
        const res = await this.database.get(
            `SELECT balance FROM Bank WHERE userID = "${userID}"`
        );
        // User bank entry does not exist
        if (res === undefined) {
            await this.createUserBankEntry(userID);
            return 0;
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
        const newBalance = (await this.checkUserBalance(userID)) + amount;
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
        const newBalance = (await this.checkUserBalance(userID)) - amount;
        if (newBalance < 0)
            throw new InsufficientBalanceError(
                `Cannot subtract ${amount} from ${userID}, would be negative (${newBalance})`
            );
        return this.setUserBalance(userID, newBalance);
    }


    // =============
    // Item stock / shop related queries
    // =============

    public async listAllShopItems(items = [], offset = 0) {
        this.assertReady();
        const limit = 100;
        const dbResponse = await this.listShopItems(limit, offset);
        const response = items.concat(dbResponse);
        if (dbResponse.length >= limit) {
            return await this.listAllShopItems(response, offset + limit)
        } else {
            return response;
        }
    }

    /**
     * Lists (at most) `count` shop items, starting with item `offset`.
     * @param limit Defaults to 100 - constrained to database limitations.
     * @param offset
     * @returns
     */
    public async listShopItems(limit = 100, offset = 0): Promise<any[]> {
        this.assertReady();
        const response = await this.database.all(`SELECT * FROM Shop ORDER BY itemName ASC LIMIT ${limit} OFFSET ${offset};`);
        if (!response) throw new DatabaseError("No data was returned while querying all items.");
        return response; // todo: do stuff with the response to conform to the Item definition
    }

    public async createShopItem(itemName: string, itemType: ItemType, itemData: ItemData, value: number) {
        this.assertReady();
        if (value < 0) throw new RangeError("Shop items must not have a negative price.");
        await this.database.exec(`INSERT INTO Shop (itemName, itemType, itemData, value) VALUES ("${itemName}", "${itemType}", "${itemData}", ${value});`);
    }

    public async getShopItem(itemID: number) {
        this.assertReady();
        await this.database.get(`SELECT FROM Shop WHERE itemID = ${itemID};`);
    }

    public async removeShopItem(itemID: number) {
        this.assertReady();
        await this.database.exec(`DELETE FROM Shop WHERE itemID = ${itemID};`);
    }
}
export const DataStorage = await DatabaseWrapper.getInstance();
// Should in theory always perform the setup
