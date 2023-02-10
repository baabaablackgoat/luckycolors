import chalk from "chalk";

export class TermColors {
    static OK(msg: string): string {return chalk.bold.bgGreen.black(` ${msg} `)};
    static Error(msg: string): string {return chalk.bold.bgRed.black(` ${msg} `)};
    static Warn(msg: string): string {return chalk.bold.bgYellow.black(` ${msg} `)};
}