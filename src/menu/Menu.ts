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
import { getLoanHandler } from "../handlers/getLoanHandler";

type MenuAction =
    | "enter"
    | "backEnter" // specifically to update the message instead of creating a new one
    | "games"
    | "balance"
    | "shop"
    | "stake"
    | "loan"
    | MenuGamesActions
    | MenuBalanceActions;
type MenuGamesActions = "blackjack" | "slots" | "draw";
type MenuBalanceActions = "daily" | "inventory";

/*  TOP LEVEL MENU - Publically visible  */
const publicMenuEntranceEmbed = new EmbedBuilder()
    .setTitle(Lang("menu_entryPoint_title"))
    .setDescription(Lang("menu_entryPoint_description"))
    .setColor(0xff0088);
const publicMenuEntranceButtonRow = [
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(Lang("menu_entryPoint_buttonLabel"))
            .setStyle(ButtonStyle.Primary)
            .setCustomId("menu_enter")
    ),
];

/* First level menu, reached after clicking "enter" or issuing menu command */
export const mainMenuEmbed = new EmbedBuilder()
    .setTitle(Lang("mainMenu_text_title"))
    .setDescription(Lang("mainMenu_text_description"))
    .setColor(0xff0088)
    .setImage("https://baabaablackgoat.com/res/salem/menuLobbyGlass.png");
export const mainMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_games"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_games"),
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_balance"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_balance"),
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_shop"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_shop")
);

/* game selection menu */
const gamesMenuEmbed = new EmbedBuilder()
    .setTitle(Lang("gamesMenu_text_title"))
    .setDescription(Lang("gamesMenu_text_description"))
    .setColor(0xff0088)
    .setImage("https://baabaablackgoat.com/res/salem/menuCasinoGlass.png");
const gamesMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel(Lang("gamesMenu_button_blackjack"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_blackjack"),
    new ButtonBuilder()
        .setLabel(Lang("gamesMenu_button_slots"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_slots"),
    new ButtonBuilder()
        .setLabel(Lang("gamesMenu_button_drawCard"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_draw")
);

/* balance menu */
function balanceMenuEmbed(balance: number) {
    return new EmbedBuilder()
        .setTitle(Lang("balanceMenu_text_title"))
        .setDescription(
            Lang("balanceMenu_text_description", { balance: balance })
        )
        .setColor(0xff0088);
}

const balanceMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel(Lang("balanceMenu_button_daily"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_daily"),
    new ButtonBuilder()
        .setLabel(Lang("balanceMenu_button_inventory"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_inventory"),
    new ButtonBuilder()
        .setLabel(Lang("balanceMenu_button_getLoan"))
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("menu_loan")
);
/* Row specifically to go back home */
const backHomeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel(Lang("menu_text_back"))
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("menu_backEnter")
);

/* Blackjack wager embed */
const blackjackStakeEmbed = new EmbedBuilder()
    .setTitle(Lang("blackjack_reply_title"))
    .setDescription(Lang("menu_text_stakeDescription"))
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
        case "loan":
            await interaction.deferReply({ ephemeral: true });
            void getLoanHandler(interaction);
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
