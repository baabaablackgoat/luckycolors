import { Database, open as dbOpen } from "sqlite";
import sqlite3 from "sqlite3";

class DatabaseError extends Error {}

export class DatabaseWrapper {
    private static instance: DatabaseWrapper;
    private static ready: boolean = false;
    private database: Database;
    async setupDatabase(): Promise<void> {
        this.database = await dbOpen({
            filename: "./database.db",
            driver: sqlite3.Database,
        });
        // Creating tables, should they not exist
        await this.database.exec("CREATE TABLE IF NOT EXISTS Bank (user_id INTEGER PRIMARY KEY, value REAL)");

        DatabaseWrapper.ready = true;
    }

    private constructor() {
        // intentional no-op to implement singleton behaviour
    }
    public static async getInstance() {
        if (!DatabaseWrapper.instance)
            DatabaseWrapper.instance = new DatabaseWrapper();

        if (!DatabaseWrapper.ready) {
            await DatabaseWrapper.instance.setupDatabase();
        }
        return DatabaseWrapper.instance;
    }

    private assertReady() {
        if (!DatabaseWrapper.ready) throw new DatabaseError("Database is not ready.");
    }


}
export const DataStorage = DatabaseWrapper.getInstance();
// Should in theory always perform the setup
