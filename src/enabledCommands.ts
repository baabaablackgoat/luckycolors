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
    shop,
} from "./commands/UserShopCommands.js";
import { daily } from "./commands/DailyStreakCommand.js";
import { drawCard } from "./commands/BlackjackCommands.js";
import { slots } from "./commands/SlotsCommands.js";

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
    shop,
    daily,
    drawCard,
    slots,
];
