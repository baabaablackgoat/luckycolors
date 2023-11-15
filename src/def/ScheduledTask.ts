import CronParser, { CronExpression } from "cron-parser";
const { parseExpression } = CronParser;

export class ScheduledTask {
    private readonly name: string;
    private readonly callback: () => void | (() => Promise<void>);
    private readonly parsedCron: CronExpression;
    private currentTimeout: NodeJS.Timeout;
    constructor(name: string, cronString: string, callback: () => void) {
        this.name = name;
        try {
            this.parsedCron = parseExpression(cronString);
        } catch (e) {
            throw new Error(
                "Couldn't create ScheduledTask: passed cronString couldn't be parsed.",
                { cause: e }
            );
        }
        this.callback = callback;
        // schedule next execution immediately
        this.scheduleNextExecution();
    }

    scheduleNextExecution() {
        const nextExecution = this.parsedCron.next();
        const millisToExecution = nextExecution.getTime() - Date.now();
        if (millisToExecution < 0)
            throw new Error(
                `Scheduling of ScheduledTask ${this.name} would cause execution in the past`
            );
        console.log(
            `Scheduling ScheduledTask ${
                this.name
            } to run at ${nextExecution.toString()} (in ${millisToExecution}ms)`
        );
        this.currentTimeout = setTimeout(() => {
            console.log(`Executing ScheduledTask ${this.name}.`);
            this.callback();
            this.scheduleNextExecution();
        }, millisToExecution);
    }

    stopTask() {
        clearTimeout(this.currentTimeout);
        console.log(`ScheduledTask ${this.name} has been cancelled.`);
    }
}
