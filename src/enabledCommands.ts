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
import { blackjack, drawCard } from "./commands/BlackjackCommands.js";
import { slots } from "./commands/SlotsCommands.js";
import { sendMenu } from "./menu/Menu.js";
import { enter } from "./commands/MenuEntryCommand.js";
import { setBirthday } from "./commands/BirthdayCommands.js";

export const enabledCommands: Command[] = [
    ping,
    setBirthday,
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
    blackjack,
    sendMenu,
    enter,
];
