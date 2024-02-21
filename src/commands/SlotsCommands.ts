import { Command } from "../def/Command.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import {
    DataStorage,
    InsufficientBalanceError,
} from "../def/DatabaseWrapper.js";
import { randomInt } from "../def/randomInt.js";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { getValidStake } from "../def/isValidStake.js";

export const slots = new Command(
    "slots", // TODO translate me!
    "Play on a simulated slot machine for your 🪙", // TODO translate me!
    async (interaction) => {
        const stake = getValidStake(
            interaction,
            interaction.options.getNumber("stake")
        );
        if (stake <= 0) return;
        void slotsExecute(interaction, stake);
    },
    [
        {
            name: "stake", // TODO translate me!
            description: `The amount of credits to stake. Must be between 1 and 5`, // TODO translate me!
            type: "Number",
            required: true,
        },
    ]
);

type SlotSymbol = {
    payout: number;
    weight: number;
    symbol: string | null;
};

const slotsWeights: Array<SlotSymbol> = [
    { payout: 0, weight: 20, symbol: null },
    { payout: 1, weight: 10, symbol: ":grapes:" },
    { payout: 1.5, weight: 5, symbol: ":tangerine:" },
    { payout: 2, weight: 3, symbol: ":cherries:" },
    { payout: 5, weight: 2, symbol: ":watermelon:" },
    { payout: 10, weight: 1, symbol: "<:seben:1209838452250640424>" },
];

const totalSlotWeights = () =>
    slotsWeights.reduce((acc, cur) => acc + cur.weight, 0);
export function calculateExpectedValue() {
    const totalWeight = totalSlotWeights();
    return slotsWeights.reduce(
        (acc, cur) => acc + cur.payout * (cur.weight / totalWeight),
        0
    );
}

/* I see you're reading the code.
/ Yes, slots is completely fucking rigged. That's the point. Realism!
/ Please don't gamble with your actual money. And if you do, set a strict limit on yourself.
 This is all for fake coins that have no value.
*/

export function chooseSlotsOutcome(): SlotSymbol {
    const randomizedWeight = Math.random() * totalSlotWeights();
    let sum = 0;
    let chosenOutcome: { payout: number; weight: number; symbol: string };
    for (let i = 0; i < slotsWeights.length; i++) {
        const possibleOutcome = slotsWeights[i];
        sum += possibleOutcome.weight;
        if (sum >= randomizedWeight) {
            chosenOutcome = possibleOutcome;
            break;
        }
    }
    if (chosenOutcome) return chosenOutcome;
    throw new Error(
        `Couldn't determine a slots outcome. Chosen weight: ${randomizedWeight}, total weight: ${totalSlotWeights()}`
    );
}

export function constructFakeSlotsResult(outcome: SlotSymbol) {
    const outputLength = 3;
    const possibleFakeSymbols = slotsWeights.filter((el) => el.symbol !== null);
    if (outcome.payout === 0) {
        let choices = [];
        for (let i = 0; i < outputLength; i++) {
            if (i === outputLength - 1) {
                // ensure the last symbol does not match by taking the "next" symbol
                const index = possibleFakeSymbols.indexOf(
                    choices[choices.length - 1]
                );
                choices.push(
                    possibleFakeSymbols[
                        (index + 1) % possibleFakeSymbols.length
                    ]
                );
            } else
                choices.push(
                    possibleFakeSymbols[
                        randomInt(0, possibleFakeSymbols.length - 1)
                    ]
                );
        }
        return choices.reduce((acc, cur) => acc + cur.symbol, "");
    } else {
        return `${outcome.symbol} `.repeat(3).trim();
    }
}

export async function slotsExecute(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    stake: number
) {
    await interaction.deferReply({ ephemeral: true });
    const userBalance = await DataStorage.getUserBalance(interaction.user.id);
    try {
        await DataStorage.subtractUserBalance(interaction.user.id, stake);
    } catch (e) {
        if (e instanceof InsufficientBalanceError) {
            void replyWithEmbed(
                interaction,
                "Not enough 🪙",
                `Your current balance: ${userBalance}`,
                "warn",
                interaction.user
            );
            return;
        } else throw e;
    }
    const outcome = chooseSlotsOutcome();
    void replyWithEmbed(
        interaction,
        "Slots woa",
        constructFakeSlotsResult(outcome),
        "info"
    );
}
