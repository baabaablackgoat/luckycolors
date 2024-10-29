export class ReadableTime {
    hours: number;
    minutes: number;
    seconds: number;

    constructor(millis: number) {
        this.hours = Math.floor(millis / (1000 * 60 * 60));
        this.minutes = Math.floor(millis / (1000 * 60)) % 60;
        this.seconds = Math.floor(millis / 1000) % 60;
    }

    toString(seconds = false): string {
        if (seconds) return `${this.hours}:${this.minutes}:${this.seconds}`;
        else return `${this.hours}h${this.minutes}`;
    }
}
