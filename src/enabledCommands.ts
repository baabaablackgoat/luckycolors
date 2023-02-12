import { Command } from "./def/Command.js";
import { ping } from "./commands/ping.js";
import { balance } from "./commands/balance.js";

export const enabledCommands: Command[] = [ping, balance];
