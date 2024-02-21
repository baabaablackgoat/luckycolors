import {
    chooseSlotsOutcome,
    constructFakeSlotsResult,
} from "./commands/SlotsCommands.js";
for (let i = 0; i < 50; i++) {
    let printResult = constructFakeSlotsResult({
        payout: 0,
        weight: 0,
        symbol: null,
    });
    console.log(`PRINT: ${printResult}`);
}
