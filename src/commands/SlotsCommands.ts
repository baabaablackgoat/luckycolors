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
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
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
        if (stake <= 0 || stake > 5) return;
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
        BotSettings.getSetting("slotWeights")
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

export function calculateExpectedSlotsValue() {
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
    if (stake <= 0 || stake > 5) {
        void replyWithEmbed(
            interaction,
            "Invalid stake",
            `You can't stake ${stake} coins.`,
            "warn",
            interaction.user,
            true
        );
        return;
    }
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
    // todo translate
    void replyWithEmbed(
        interaction,
        "Slots",
        "Spinning the wheels...",
        "info",
        interaction.user,
        true,
        undefined,
        new URL("https://baabaablackgoat.com/res/salem/pendingCompressed.gif")
    );
    const slotsRenderURI = await BrowserRenderer.getInstance().renderSlots(
        interaction.id,
        fakeResult,
        outcome.payout !== 0
            ? `Payout: ${stake * outcome.payout} 🪙`
            : `Lost ${stake} 🪙`
    ); // TODO translate this too!!

    setTimeout(async () => {
        await replyWithEmbed(
            interaction,
            "Slots",
            "Wheels locked.",
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
                    value: calculateExpectedSlotsValue().toString(),
                    inline: true,
                },
                {
                    name: "Fail Weight",
                    value: BotSettings.getSetting("slotsNullWeight").toString(),
                    inline: true,
                },
                {
                    name: "Weights",
                    value:
                        Object.entries(
                            BotSettings.getSetting("slotWeights")
                        ).reduce((prev, [key, val]) => {
                            return `${prev}\n- ${key}\t\t Pays ${val.payout}:1\t Weight ${val.weight}`;
                        }, "```md") + "```",
                    inline: false,
                },
            ]);
        const slotsAdminMenuButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Change symbol weights")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("admin_slots_weights"),
            new ButtonBuilder()
                .setLabel("Change payouts")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("admin_slots_payouts"),
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
        // case "weights":
        // void sendWeightsModal(interaction);
        // break;
        // case "payouts":
        // void sendPayoutsModal(interaction);
        // break;
        case "failweight":
            void sendFailWeightModal(interaction);
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

async function sendFailWeightModal(interaction: ButtonInteraction) {
    const payingWeight = Array.from(getSlotWeights().values()).reduce(
        (cur, sym) => {
            if (sym.payout > 0) return cur + sym.weight;
            else return cur;
        },
        0
    );

    const failWeightModal = new ModalBuilder()
        .setTitle("Configuring fail weight")
        .setCustomId("slotsFailweightModal");
    const weightInput = new TextInputBuilder()
        .setCustomId("slotsFailweightModal_weight")
        .setLabel(`New loss chance (paying weights sum: ${payingWeight})`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(10)
        .setMinLength(1)
        .setValue(BotSettings.getSetting("slotsNullWeight").toString())
        .setRequired(true);
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        weightInput
    );
    failWeightModal.addComponents([actionRow]);
    await interaction.showModal(failWeightModal);
}

async function sendWeightsModal(interaction: ButtonInteraction) {
    // FIXME: Discord.js only allows for 5 inputs. Find a better way
    const weights = getSlotWeights();
    const weightsModal = new ModalBuilder()
        .setTitle("Configuring paying weights")
        .setCustomId("slotsWeightsModal");
    const inputs: TextInputBuilder[] = [];
    weights.forEach((sym, key) => {
        if (sym.payout == 0) return;
        const input = new TextInputBuilder()
            .setLabel(`${key} (pays ${sym.payout}:1)`)
            .setCustomId(`slotsWeightsModal_${key}`)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setMinLength(1)
            .setValue(sym.weight.toString());
        inputs.push(input);
    });
    const actionRowSize = 5;
    const actionRows: ActionRowBuilder<TextInputBuilder>[] = [];
    for (let i = 0; i < inputs.length; i += actionRowSize) {
        const chunk: TextInputBuilder[] = inputs.slice(i, i + actionRowSize);
        actionRows.push(
            new ActionRowBuilder<TextInputBuilder>().addComponents(chunk)
        );
    }
    weightsModal.addComponents(actionRows);
    await interaction.showModal(weightsModal);
}

async function sendPayoutsModal(interaction: ButtonInteraction) {
    // FIXME: Discord.js only allows for 5 inputs. Find a better way
    const weights = getSlotWeights();
    const weightsModal = new ModalBuilder()
        .setTitle("Configuring payouts. Enter as val:1")
        .setCustomId("slotsPayoutsModal");
    const actionRows = [];
    weights.forEach((sym, key) => {
        if (sym.payout == 0) return;
        const input = new TextInputBuilder()
            .setLabel(`${key} (Weight: ${sym.weight})`)
            .setCustomId(`weightsModal_${key}`)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setMinLength(1)
            .setValue(sym.payout.toString());
        actionRows.push(
            new ActionRowBuilder<TextInputBuilder>().addComponents(input)
        );
    });
    weightsModal.addComponents(actionRows);
    await interaction.showModal(weightsModal);
}
