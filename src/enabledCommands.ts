import { Command } from "./def/Command.js";
import { ping } from "./commands/ping.js";
import {
    addBalance,
    balance,
    setBalance,
    subtractBalance,
} from "./commands/BalanceCommands.js";
import { addRoleItem } from "./commands/AdminShopCommands.js";
import {
    buyItem,
    listOwnedItems,
    useItem,
    listItems,
} from "./commands/UserShopCommands.js";

export const enabledCommands: Command[] = [
    ping,
    balance,
    setBalance,
    addBalance,
    subtractBalance,
    addRoleItem,
    buyItem,
    listOwnedItems,
    useItem,
    listItems,
];
