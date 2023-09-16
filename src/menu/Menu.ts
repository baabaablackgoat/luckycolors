import { assertAdminPermissions, Command } from "../def/Command";
import { Lang } from "../lang/LanguageProvider";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
    User,
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
import { BirthdayResponse, DataStorage } from "../def/DatabaseWrapper";
import { getLoanHandler } from "../handlers/getLoanHandler";
import { sendBirthdayModal } from "../commands/BirthdayCommands";
import { birthdayIsChangeable, formatBirthday } from "../def/FormatBirthday";
import { comingSoonReply } from "../commands/SlotsCommands";

type MenuAction =
    | "enter"
    | "backEnter" // specifically to update the message instead of creating a new one
    | "games"
    | "profile"
    | "shop"
    | "stake"
    | "loan"
    | "setBirthday"
    | "about"
    | MenuGamesActions
    | MenuProfileActions;
type MenuGamesActions = "blackjack" | "slots" | "draw";
type MenuProfileActions = "daily" | "inventory";

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
    .setImage("https://baabaablackgoat.com/res/salem/menuLobbyGlass2.png");
export const mainMenuButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_games"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_games"),
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_profile"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_profile"),
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_shop"))
        .setStyle(ButtonStyle.Primary)
        .setCustomId("menu_shop"),
    new ButtonBuilder()
        .setLabel(Lang("mainMenu_button_about"))
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("menu_about")
);

/* game selection menu */
const gamesMenuEmbed = new EmbedBuilder()
    .setTitle(Lang("gamesMenu_text_title"))
    .setDescription(Lang("gamesMenu_text_description"))
    .setColor(0xff0088)
    .setImage("https://baabaablackgoat.com/res/salem/menuCasinoGlass2.png");
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

/* profile menu */
function profileMenuEmbed(
    user: User,
    balance: number,
    birthday: BirthdayResponse
) {
    return new EmbedBuilder()
        .setTitle(Lang("profileMenu_text_title"))
        .setDescription(Lang("profileMenu_text_description"))
        .setAuthor({
            name: user.username,
            iconURL: user.avatarURL(),
        })
        .setColor(0xff0088)
        .setImage("https://baabaablackgoat.com/res/salem/menuProfileGlass2.png")
        .addFields([
            {
                name: Lang("profileMenu_field_balanceName"),
                value: Lang("profileMenu_field_balanceValue", {
                    balance: balance,
                }),
                inline: true,
            },
            {
                name: Lang("profileMenu_field_birthdayName"),
                value: formatBirthday(birthday),
                inline: true,
            },
        ]);
}

function profileMenuButtonRow(balance: number, birthday: BirthdayResponse) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(Lang("profileMenu_button_daily"))
            .setStyle(ButtonStyle.Primary)
            .setCustomId("menu_daily"),
        new ButtonBuilder()
            .setLabel(Lang("profileMenu_button_inventory"))
            .setStyle(ButtonStyle.Primary)
            .setCustomId("menu_inventory")
    );
    // if (balance < 25) commented out for now - we like having negative responses here :3c
    row.addComponents(
        new ButtonBuilder()
            .setLabel(Lang("profileMenu_button_getLoan"))
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("menu_loan")
    );

    if (birthdayIsChangeable(birthday))
        row.addComponents(
            new ButtonBuilder()
                .setLabel(Lang("profileMenu_button_setBirthday"))
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("menu_setBirthday")
        );
    return row;
}

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

function sendAboutEmbed(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setTitle(Lang("about_header_title"))
        .setDescription(Lang("about_header_description"))
        .addFields(
            {
                name: "Made with ♥️ by",
                value: "Salem & Niklas",
                inline: true,
            },
            {
                name: "Source code",
                value: "coming soon, I promise!",
                inline: true,
            },
            {
                name: "Hosting location",
                value: "Hetzner GmbH, Falkenstein cluster",
                inline: true,
            }
        );
    void interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

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
        case "profile":
            const userBal = DataStorage.getUserBalance(interaction.user.id);
            const birthday = DataStorage.getBirthday(interaction.user.id);
            Promise.all([userBal, birthday]).then(([userBal, birthday]) => {
                //@ts-ignore: actual garbage typings
                void interaction.update({
                    embeds: [
                        profileMenuEmbed(interaction.user, userBal, birthday),
                    ],
                    components: [
                        profileMenuButtonRow(userBal, birthday),
                        backHomeRow,
                    ],
                });
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
            void comingSoonReply(interaction);
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
        case "setBirthday":
            // do not defer the reply - the modal refuses to send if the initial reply was deferred.
            void sendBirthdayModal(interaction);
            break;
        case "about":
            void sendAboutEmbed(interaction);
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
