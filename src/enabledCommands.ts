import { Command } from "./def/Command.js";
import { ping } from "./commands/ping.js";
import {addBalance, balance, setBalance, subtractBalance} from "./commands/BalanceCommands.js";

export const enabledCommands: Command[] = [
    ping,
    balance,
    setBalance,
    addBalance,
    subtractBalance
];
