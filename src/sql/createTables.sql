CREATE TABLE IF NOT EXISTS Bank (
    userID TEXT,
    balance REAL DEFAULT (0) CHECK(balance >= 0),
    CONSTRAINT Bank_PK PRIMARY KEY (userID)
);

CREATE TABLE IF NOT EXISTS Shop (
    itemID INTEGER,
    itemName TEXT,
    itemType TEXT,
    itemData TEXT,
    value REAL DEFAULT (0),
    CONSTRAINT Shop_PK PRIMARY KEY (itemID)
);

CREATE TABLE IF NOT EXISTS Inventory (
    entryID INTEGER,
    itemID INTEGER,
    userID TEXT,
    CONSTRAINT Inventory_PK PRIMARY KEY (entryID),
    CONSTRAINT userID_FK FOREIGN KEY (userID) REFERENCES Bank(userID) ON DELETE CASCADE,
    CONSTRAINT itemID_FK FOREIGN KEY (itemID) REFERENCES Shop(itemID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Streaks (
    userID TEXT,
    streak INTEGER DEFAULT (0),
    lastClaimed TEXT,
    CONSTRAINT Streaks_PK PRIMARY KEY (userID)
);

CREATE TABLE IF NOT EXISTS Birthdays (
   userID TEXT,
   "day" INTEGER,
   "month" INTEGER,
   "year" INTEGER,
   CONSTRAINT Birthdays_PK PRIMARY KEY (userId)
);
