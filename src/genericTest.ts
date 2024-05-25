import { shuffleArray } from "./def/ShuffleArray.ts";

const input = [
    "hello",
    "world",
    "programmed",
    "to",
    "work",
    "and",
    "not",
    "to",
    "feel",
];
console.log(input.join(" "));
shuffleArray(input);
console.log(input.join(" "));
