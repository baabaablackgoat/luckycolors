import { ScheduledTask } from "./ScheduledTask.js";

const heck = new ScheduledTask("heck", "*/5 * * * * *", () =>
    console.log("heck!")
);
