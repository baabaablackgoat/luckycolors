import { Command } from "../def/Command.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import {
    DataStorage,
    InsufficientBalanceError,
} from "../def/DatabaseWrapper.js";
import { randomInt } from "../def/randomInt.js";
import { ChatInputCommandInteraction } from "discord.js";
import { getValidStake } from "../def/isValidStake.js";

type SlotSymbol = {
    emoji: string;
    weight: number;
    payout: number;
};

const SlotSymbols: SlotSymbol[] = [
    {
        emoji: "🍈",
        weight: 10,
        payout: 2,
    },
    {
        emoji: "🍍",
        weight: 5,
        payout: 5,
    },
    {
        emoji: "7️⃣",
        weight: 3,
        payout: 10,
    },
    {
        emoji: "⭐",
        weight: 2,
        payout: 20,
    },
    {
        emoji: "👽",
        weight: 1,
        payout: 50,
    },
];
const totalWeight = SlotSymbols.map((i) => i.weight).reduce((i, j) => i + j);

function symbolPicker(): SlotSymbol {
    const randomizedWeight = Math.random() * totalWeight;
    let sum = 0;
    let chosenSymbol: SlotSymbol | undefined;
    for (let i = 0; i < SlotSymbols.length; i++) {
        const symbol = SlotSymbols[i];
        sum += symbol.weight;
        if (sum >= randomizedWeight) {
            chosenSymbol = symbol;
            break;
        }
    }
    if (chosenSymbol) return chosenSymbol;
    // This should never happen, but just in case something went wrong - return the first known symbol.
    console.warn(
        `The symbol picker function has not reached a decision after iterating through all symbols.
        This is a bug! Returning the first symbol by default.
        Chosen weight: ${randomizedWeight}, total weight: ${totalWeight}`
    );
    return SlotSymbols[0];
}

export const slots = new Command(
    "slots",
    "Play on a simulated slot machine for your 🪙",
    async (interaction) => {
        const stake = getValidStake(
            interaction,
            interaction.options.getNumber("stake")
        );
        if (stake === 0) return;
        await interaction.deferReply({ ephemeral: true });
        const userBalance = await DataStorage.getUserBalance(
            interaction.user.id
        );
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

        // write the first response before the delayed results
        const toasts = [
            "The wheels go speen",
            "haha, slots go brr",
            "WHEEEEEEEEL OF MONEY",
            "speen.",
            "Spinning the slot wheels...",
            "speen-ing the slot wheels...",
            "Waiting for Salem to turn the handcrank on this bad boy...",
        ];
        await replyWithEmbed(
            interaction,
            toasts[randomInt(0, toasts.length)],
            `Spinning the wheels for ${stake} 🪙...\n⬛    ⬛    ⬛`,
            "info"
        );
        // fake calculation time :3c
        setTimeout(() => {
            slotResultsShower(interaction, stake);
        }, 1000);
    },
    [
        {
            name: "stake",
            description: `The amount of credits to stake. Must be between `,
            type: "Number",
            required: true,
        },
    ]
);

/**
 * This function is here to be called by setTimeout, to give the illusion of spinning slots
 * @param interaction The interaction that called the slots
 * @param stake The stake that was set.
 */
async function slotResultsShower(
    interaction: ChatInputCommandInteraction,
    stake: number
) {
    const slotResults: SlotSymbol[] = [];
    for (let i = 0; i < 3; i++) {
        slotResults.push(symbolPicker());
    }

    const won: boolean =
        slotResults[0].emoji === slotResults[1].emoji &&
        slotResults[0].emoji === slotResults[2].emoji;

    const slotResultsString = `${slotResults[0].emoji}    ${slotResults[1].emoji}    ${slotResults[2].emoji}`;
    if (won) {
        const wonCredits = stake * slotResults[0].payout;
        await DataStorage.addUserBalance(interaction.user.id, wonCredits);
        void replyWithEmbed(
            interaction,
            "You win!",
            `${stake} 🪙 => **${wonCredits} 🪙**\n${slotResultsString}`,
            "info",
            interaction.user
        );
    } else {
        void replyWithEmbed(
            interaction,
            "oof.",
            `Better luck next time.\n${slotResultsString}`,
            "info",
            interaction.user
        );
    }
}
