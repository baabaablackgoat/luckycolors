import { assertAdminPermissions, Command } from "../def/Command";
import { Lang } from "../lang/LanguageProvider";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { replyWithEmbed } from "../def/replyWithEmbed";
import {
    listOwnedItemsExecute,
    shopExecute,
} from "../commands/UserShopCommands";
import {
    blackjackExecute,
    drawCardExecute,
} from "../commands/BlackjackCommands";
import { dailyExecute } from "../commands/DailyStreakCommand";
import { DataStorage } from "../def/DatabaseWrapper";

type MenuAction =
    | "enter"
    | "backEnter" // specifically to update the message instead of creating a new one
    | "games"
    | "balance"
    | "shop"
    | "stake"
    | MenuGamesActions
    | MenuBalanceActions;
type MenuGamesActions = "blackjack" | "slots" | "draw";
type MenuBalanceActions = "daily" | "inventory";

/*  TOP LEVEL MENU - Publically visible  */
const publicMenuEntranceEmbed = new EmbedBuilder()
    .setTitle(Lang("menu_entryPoint_title"))
    .setDescription(Lang("menu_entryPoint_description"))
    .setColor(0xff0088);
// .setImage("https://baabaablackgoat.com/res/salem/menuLobby2.png");
const publicMenuEntranceButtonRow = [
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(Lang("menu_entryPoint_buttonLabel"))
            .setStyle(ButtonStyle.Primary)
            .setCustomId("menu_enter")
    ),
];

/* First level menu, reached after clicking "enter" */
const mainMenuEmbed = new EmbedBuilder()
    .setTitle("Main Menu")
    .setDescription("Select to continue")
    .setColor(0xff0088)
    .setImage("https://baabaablackgoat.com/res/salem/menuLobby2.png");
const mainMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel("Games")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_games"),
    new ButtonBuilder()
        .setLabel("Balance")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_balance"),
    new ButtonBuilder()
        .setLabel("Shop")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_shop")
);

/* game selection menu */
const gamesMenuEmbed = new EmbedBuilder()
    .setTitle("Games")
    .setDescription("What would you like to play?")
    .setColor(0xff0088)
    .setImage("https://baabaablackgoat.com/res/salem/menuCasino2.png");
const gamesMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel("Blackjack")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_blackjack"),
    new ButtonBuilder()
        .setLabel("Slots")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_slots"),
    new ButtonBuilder()
        .setLabel("Draw a card")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_draw")
);

/* balance menu */
function balanceMenuEmbed(balance: number, currencySymbol = "🪙") {
    return new EmbedBuilder()
        .setTitle("Balance")
        .setDescription(`Your current balance is ${balance} ${currencySymbol}`)
        .setColor(0xff0088);
}

const balanceMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel("Daily claim")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_daily"),
    new ButtonBuilder()
        .setLabel("Open inventory")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_inventory")
);
/* Row specifically to go back home */
const backHomeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("menu_backEnter")
);

/* Blackjack wager embed */
const blackjackStakeEmbed = new EmbedBuilder()
    .setTitle("Blackjack")
    .setDescription("Choose an amount to stake")
    .setColor(0xff0088);

/* Stake Menu constructor */
function stakeRowConstructor(gameId: string, wagerSymbol = "🪙") {
    const wagers = [1, 2, 5, 10, 25];
    const row = new ActionRowBuilder();
    wagers.forEach((wager) => {
        row.addComponents(
            new ButtonBuilder()
                .setLabel(`${wager} ${wagerSymbol}`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`menu_stake_${gameId}_${wager}`)
        );
    });
    return row;
}

export const sendMenu = new Command(
    Lang("command_sendMenu_name"),
    Lang("command_sendMenu_description"),
    async (interaction) => {
        if (!(await assertAdminPermissions(interaction))) return;
        await interaction.deferReply({ ephemeral: true });
        let targetedChannel = interaction.options.getChannel(
            Lang("command_sendMenu_argChannel")
        );
        if (!targetedChannel) targetedChannel = interaction.channel;
        if (!(targetedChannel instanceof TextChannel)) {
            console.warn(
                "User somehow reached a non-text channel, this should be impossible.",
                targetedChannel
            );
            return;
        }
        targetedChannel
            .send({
                embeds: [publicMenuEntranceEmbed],
                //@ts-ignore: what the fuck is wrong with you, discord.js??
                components: publicMenuEntranceButtonRow,
            })
            .then(
                void interaction.editReply(
                    "Menu message sent. You can safely dismiss this message."
                )
            )
            .catch((e) => {
                console.error(
                    `Couldn't send the menu embed in the channel ${targetedChannel.name}`,
                    e
                );
                void interaction.editReply(
                    "Something went wrong while trying to send the menu message..."
                );
            });
    },
    [
        {
            name: Lang("command_sendMenu_argChannel"),
            description: Lang("command_sendMenu_argChannelDescription"),
            type: "TextChannel",
            required: false,
        },
    ]
);

export async function menuButtonHandler(interaction: ButtonInteraction) {
    // await interaction.deferReply({ ephemeral: true });
    const menuTarget = interaction.customId.split("_")[1] as MenuAction;
    switch (menuTarget) {
        case "enter":
            // This is the only interaction type pointing back into the menu that should send a new message.
            void interaction.reply({
                embeds: [mainMenuEmbed],
                //@ts-ignore: fuck off
                components: [mainMenuButtonRow],
                ephemeral: true,
            });
            break;
        case "backEnter":
            // this should render the same interaction as enter, but it edits the original message.
            void interaction.update({
                embeds: [mainMenuEmbed],
                //@ts-ignore: @discord.js, why?
                components: [mainMenuButtonRow],
            });
            break;
        case "games":
            //@ts-ignore: ree
            void interaction.update({
                embeds: [gamesMenuEmbed],
                components: [gamesMenuButtonRow, backHomeRow],
            });
            break;
        case "balance":
            const userBal = await DataStorage.getUserBalance(
                interaction.user.id
            );
            //@ts-ignore: actual garbage typings
            void interaction.update({
                embeds: [balanceMenuEmbed(userBal)],
                components: [balanceMenuButtonRow, backHomeRow],
            });
            break;
        case "shop":
            void shopExecute(interaction);
            break;
        case "inventory":
            void listOwnedItemsExecute(interaction);
            break;
        case "draw":
            void drawCardExecute(interaction);
            break;
        case "blackjack":
            // @ts-ignore
            void interaction.update({
                embeds: [blackjackStakeEmbed],
                components: [stakeRowConstructor("blackjack"), backHomeRow],
            });
            break;
        case "daily":
            void dailyExecute(interaction);
            break;
        case "slots":
            // todo: call slots interaction
            break;
        case "stake":
            const game = interaction.customId.split("_")[2];
            const stake = parseInt(interaction.customId.split("_")[3]);
            if (isNaN(stake) || stake <= 0) return;
            switch (game) {
                case "blackjack":
                    void blackjackExecute(interaction, stake);
                    break;
                default:
                    // TODO: report that something went wrong
                    break;
            }
            break;
        default:
            void replyWithEmbed(
                interaction,
                Lang("menu_error_unknownInteractionTitle"),
                Lang("menu_error_unknownInteractionDescription"),
                "error",
                interaction.user,
                true
            );
            break;
    }
}
