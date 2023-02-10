CREATE TABLE IF NOT EXISTS Bank (
    userID INTEGER PRIMARY KEY,
    balance REAL
);

CREATE TABLE IF NOT EXISTS AvailableItems (
	value REAL,
	itemName TEXT,
	itemType TEXT,
	itemData TEXT,
	CONSTRAINT AvailableItems_PK PRIMARY KEY (itemName)
);

CREATE TABLE IF NOT EXISTS Inventory (
	entryID INTEGER PRIMARY KEY AUTOINCREMENT,
	itemName TEXT,
	userID INTEGER,
	CONSTRAINT TargetedItem_FK FOREIGN KEY (itemName) REFERENCES AvailableItems(itemName),
	CONSTRAINT TargetedUser_FK FOREIGN KEY (userID) REFERENCES Bank(userID)
);
