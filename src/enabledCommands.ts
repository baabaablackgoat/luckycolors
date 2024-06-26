import { Command } from "./def/Command.js";
import { ping } from "./commands/ping.js";
import {
    addBalance,
    balance,
    setBalance,
    subtractBalance,
} from "./commands/BalanceCommands.js";
import {
    addRoleItem,
    changePrice,
    relistItem,
    removeItem,
    unlistItem,
} from "./commands/AdminShopCommands.js";
import {
    buyItem,
    listItems,
    listOwnedItems,
    shop,
    useItem,
} from "./commands/UserShopCommands.js";
import { daily } from "./commands/DailyStreakCommand.js";
import { blackjack, drawCard } from "./commands/BlackjackCommands.js";
import { adminSlotsMenu, slots } from "./commands/SlotsCommands.js";
import { sendMenu } from "./menu/Menu.js";
import { enter } from "./commands/MenuEntryCommand.js";
import { setBirthday } from "./commands/BirthdayCommands.js";
import {
    setAnnouncementChannel,
    setInteractionChannel,
} from "./commands/AdminChannelSelectionCommands.js";

export const enabledCommands: Command[] = [
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
    setAnnouncementChannel,
    setInteractionChannel,
    adminSlotsMenu,
    unlistItem,
    relistItem,
    changePrice,
    removeItem,
];
