import { assertAdminPermissions, Command } from "../def/Command.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import {
    DataStorage,
    InsufficientBalanceError,
} from "../def/DatabaseWrapper.js";
import { randomInt } from "../def/randomInt.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import { getValidStake } from "../def/isValidStake.js";
import { BotSettings } from "../def/SettingsHandler.ts";
import { objectToMap } from "../def/MapHelpers.ts";
import { BrowserRenderer } from "../webrender/BrowserRenderer.ts";

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

/*
/ Yes, slots is completely fucking rigged. That's the point. Realism!
/ Please don't gamble with your actual money. And if you do, set a strict limit on yourself.
/ This is all for fake coins that have no value.
*/

export type SlotSymbol = {
    payout: number;
    weight: number;
    symbol: string | null;
};

function getSlotWeights(): Map<string, SlotSymbol> {
    const settingsWeights = objectToMap<SlotSymbol>(
        BotSettings.getSetting("slotsEmotes")
    );
    const nullWeight = BotSettings.getSetting("slotsNullWeight");
    return new Map([
        ["failWeight", { payout: 0, weight: nullWeight, symbol: null }],
        ...settingsWeights,
    ]);
}

const totalSlotWeights = () =>
    Array.from(getSlotWeights()).reduce(
        (acc, [_name, cur]) => acc + cur.weight,
        0
    );

export function calculateExpectedValue() {
    const totalWeight = totalSlotWeights();
    return Array.from(getSlotWeights()).reduce(
        (acc, [_name, cur]) => acc + cur.payout * (cur.weight / totalWeight),
        0
    );
}

export function chooseSlotsOutcome(): [string, SlotSymbol] {
    const randomizedWeight = Math.random() * totalSlotWeights();
    let sum = 0;
    const slotsWeights = getSlotWeights();
    const weightIterator = slotsWeights.entries();
    let chosenOutcome: [string, SlotSymbol];
    for (let i = 0; i < slotsWeights.size; i++) {
        const iter = weightIterator.next();
        if (iter.done)
            throw new Error(
                "The slots weights iterator was exceeded - How the hell did this happen"
            );
        const possibleOutcome = iter.value as [string, SlotSymbol];
        sum += possibleOutcome[1].weight;
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

export function getExistingSlotsSymbols(): SlotSymbol[] {
    return [...getSlotWeights()]
        .filter((el) => el[1].symbol !== null)
        .map((el) => el[1]);
}

export function getFakeSlotSymbolIcons(outcome: SlotSymbol): Array<SlotSymbol> {
    const outputLength = 3;
    const possibleFakeSymbols = getExistingSlotsSymbols();
    if (outcome.payout === 0) {
        let choices: Array<SlotSymbol> = [];
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
        return choices.map((choice) => choice);
    } else {
        return Array(3).fill(outcome);
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
    const outcome = chooseSlotsOutcome()[1];
    const fakeResult = getFakeSlotSymbolIcons(outcome);
    void replyWithEmbed(interaction, "Slots woa", "spinning", "info");
    const slotsRenderURI = await BrowserRenderer.getInstance().renderSlots(
        interaction.id,
        fakeResult
    );

    setTimeout(async () => {
        await replyWithEmbed(
            interaction,
            "Slots woa",
            "woa!",
            "info",
            interaction.user,
            true,
            undefined,
            slotsRenderURI
        );
        if (outcome.payout !== 0)
            DataStorage.addUserBalance(
                interaction.user.id,
                Math.ceil(stake * outcome.payout)
            );
        await BrowserRenderer.getInstance().cleanupSlots(interaction.id);
    }, 1500);
}

export const adminSlotsMenu = new Command(
    "slotsadmin",
    "Change settings for the slots minigame",
    async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        if (!(await assertAdminPermissions(interaction))) return;
        const slotsAdminMenuEmbed = new EmbedBuilder()
            .setTitle("Admin slots menu")
            .setDescription("Configure stuff here")
            .setColor(0xff0088)
            .addFields([
                {
                    name: "Current expected value",
                    value: calculateExpectedValue().toString(),
                    inline: true,
                },
                {
                    name: "Configured emotes",
                    value: BotSettings.getSetting(
                        "slotsEmotes"
                    ).length.toString(),
                    inline: true,
                },
            ]);
        const slotsAdminMenuButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Change weights")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("admin_slots_weights"),
            new ButtonBuilder()
                .setLabel("Change fail weight")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("admin_slots_failweight")
        );
        void interaction.editReply({
            embeds: [slotsAdminMenuEmbed],
            // @ts-ignore: fuck off 2 electric boogaloo
            components: [slotsAdminMenuButtons],
        });
    }
);

export async function slotsAdminButtonHandler(
    interaction: ButtonInteraction,
    subTarget: string
) {
    if (!subTarget || subTarget.length === 0) {
        void replyWithEmbed(
            interaction,
            "No subtarget",
            "This interaction seems broken",
            "warn",
            interaction.user,
            true
        );
        return;
    }

    switch (subTarget) {
        case "weights":
        case "failweight":
            void replyWithEmbed(
                interaction,
                "Not done yet",
                "sowy im lazy and dum",
                "warn",
                interaction.user,
                true
            );
            break;
        default:
            void replyWithEmbed(
                interaction,
                "Invalid subtarget",
                "This interaction seems broken",
                "warn",
                interaction.user,
                true
            );
    }
}
