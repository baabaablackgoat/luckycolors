import { ILanguage } from "./ILanguage";
export const english: ILanguage = {
    command_daily_description:
        "Claim your daily credits! Keeping a streak earns you more.",
    command_daily_name: "daily",
    daily_error_alreadyClaimedDescription:
        "Daily claims reset at midnight UTC. You can claim additional 🪙 in $timeToClaim.\nCurrent streak: $streak",
    daily_error_alreadyClaimedTitle: "Already claimed today!",
    daily_reply_claimedDescription:
        "You have received **$received**🪙. You can claim more in **$timeToClaim**. Your current streak: **$streak**",
    daily_reply_claimedTitle: "Daily credits claimed!",
    daily_reply_birthdayTitle: "Happy $agebirthday!",
    daily_reply_birthdayDescription:
        "For your birthday, you've received **$received**🪙. You can claim more in **$timeToClaim**. Your current streak: **$streak**",
    command_ping_description: "Pong!",
    command_ping_name: "ping",
    ping_reply_text: [
        "hello world!",
        "yep, i'm alive.",
        "the end is never the end is never the end is never the end is never the",
    ],
    addBalance_error_invalidAmountDescription:
        "The new amount must be a number greater or equal to 0. Use subtractbalance or setbalance to achieve balance reduction.",
    addBalance_error_invalidAmountTitle: "Invalid amount",
    addBalance_reply_successDescription:
        "~~$oldBalance~~ -> **$newBalance** 🪙",
    addBalance_reply_successTitle: "$addedBalance 🪙 added",
    command_addBalance_argAmount: "amount",
    command_addBalance_argAmountDescription:
        "🔧 The amount of currency to add.",
    command_addBalance_argTargetUser: "target",
    command_addBalance_argTargetUserDescription: "🔧 The user to target.",
    command_addBalance_description: "🔧 Adds balance to the targeted user.",
    command_addBalance_name: "addbalance",
    command_subtractBalance_argAmount: "amount",
    command_subtractBalance_argAmountDescription:
        "🔧 The amount of currency to subtract.",
    command_subtractBalance_argTargetUser: "target",
    command_subtractBalance_argTargetUserDescription: "🔧 The user to target.",
    command_subtractBalance_description:
        "🔧 Subtracts some currency from the targeted user.",
    command_subtractBalance_name: "subtractbalance",
    subtractBalance_error_insufficientBalanceTitle: "Balance insufficient",
    subtractBalance_error_insufficientBalanceDescription:
        "The targeted user only has $oldUserBalance, and you tried to deduct $toSubtract. We don't do overdrafts here.",
    subtractBalance_error_invalidAmountDescription:
        "The new amount must be a number greater or equal to 0. Use addbalance or setbalance to give out currency.",
    subtractBalance_error_invalidAmountTitle: "Invalid amount",
    subtractBalance_reply_successDescription:
        "~~$oldBalance~~ -> **$newBalance** 🪙",
    subtractBalance_reply_successTitle: "$toSubtract 🪙 deducted",
    command_setBalance_argAmount: "amount",
    command_setBalance_argAmountDescription: "🔧 The new balance to set.",
    command_setBalance_argTargetUser: "target",
    command_setBalance_argTargetUserDescription: "🔧 The user to target.",
    command_setBalance_description: "🔧 Set any users balance",
    command_setBalance_name: "setbalance",
    setBalance_error_invalidAmountDescription:
        "The new amount must be a number greater or equal to 0.",
    setBalance_error_invalidAmountTitle: "Invalid amount",
    setBalance_reply_successDescription: "New balance: **$userBal** 🪙",
    setBalance_reply_successTitle: "Updated balance",
    command_checkBalance_description:
        "Checks your balance (🔧 or another user's balance)",
    checkBalance_reply_description: "**$userBal** 🪙",
    checkBalance_reply_title: "Your balance",
    command_checkBalance_argTargetUser: "target",
    command_checkBalance_argTargetUserDescription:
        "🔧 Check the specified users balance.",
    command_checkBalance_name: "balance",
    command_addRole_name: "addrole",
    command_addRole_description: "🔧 Adds a Discord role as a shop item.",
    command_addRole_argItemName: "name",
    command_addRole_argItemNameDescription:
        "🔧 The name this item should have.",
    command_addRole_argRole: "role",
    command_addRole_argRoleDescription: "🔧 The role to assign to this item.",
    command_addRole_argCost: "cost",
    command_addRole_argCostDescription:
        "🔧 How many 🪙 it will cost to unlock this item.",
    addItem_error_invalidCostTitle: "Invalid cost",
    addItem_error_invalidCostDescription:
        "The cost of an item must be 0 or greater. (Yes, you can set freebies!)",
    addItem_error_invalidNameTitle: "Invalid item name",
    addItem_error_invalidNameDescription:
        "Item names can only be alphanumeric and must not be empty or longer than 32 characters.",
    addItem_error_unexpectedResponseTitle: "Unexpected response received",
    addRole_error_passedRoleObjectInvalid:
        "The role you specified behaved in a weird way... feel free to try again or go yell at me.",
    addRole_error_roleTooStrongTitle: "Role too powerful!",
    addRole_error_roleTooStrongDescription:
        "This role has a higher position than my highest role. I won't be able to hand out this role.",
    addRole_error_unknownTitle: "Something went horribly wrong...",
    addRole_error_unknownDescription:
        "I couldn't create this item in my database. Go yell at my creator.",
    addRole_created_title: "Role item created!",
    addRole_created_description: "Item with associated role $roleName created.",
    itemView_ownedItem: "$name",
    itemView_unlockItem: "$name ($value 🪙)",
    itemView_prevPage: "Prev",
    itemView_nextPage: "Next",
    itemView_removeItem: "$name",
    command_card_name: "card",
    command_card_description:
        "Draw a random card from a virtually shuffled deck.",
    card_reply_title: "You've drawn...",
    card_reply_description: "$drawnCard\nCards left: $cardsLeft",
    card_error_deckMissingTitle: "Couldn't draw card",
    card_error_deckMissingDescription:
        "I couldn't retrieve the deck I was drawing from before :(",
    card_button_drawAgain: "Draw again?",
    blackjack_printHands_dealerHand: "**Dealers hand**",
    blackjack_printHands_playerHand: "**Your hand**",
    blackjack_button_hit: "Hit",
    blackjack_button_stand: "Stand",
    blackjack_button_doubleDown: "Double Down",
    blackjack_button_playAgain: "Play again ($stake 🪙)",
    blackjack_text_yourTurn: "It's your turn.",
    blackjack_text_dealerTurn: "Dealer is drawing.",
    blackjack_text_blackjackWin:
        "**BLACKJACK! Pays out 3:2.**\n$stake => $payout 🪙.",
    blackjack_text_win: "**You win!**\n$stake => $payout 🪙.",
    blackjack_text_tied: "**It's a tie.**\n$stake => $payout 🪙.",
    blackjack_text_bust: "**You went bust.**\n$stake => 0 🪙",
    blackjack_text_lost: "**You lost.**\n$stake => 0 🪙.",
    blackjack_reply_title: "Blackjack",
    blackjack_error_gameCancelledTitle: "Blackjack - Error",
    blackjack_error_gameCancelledDescription:
        "Something went wrong... The game has been cancelled and your stake has been refunded.",
    blackjack_error_invalidInteractionTitle: "Blackjack - Unknown game",
    blackjack_error_invalidInteractionDescription:
        "This interaction seems invalid - does this game still exist?",
    blackjack_error_insufficientBalanceTitle: "Insufficient balance",
    blackjack_error_insufficientBalanceDescription:
        "You can't stake 🪙 you don't have!",
    command_blackjack_name: "blackjack",
    command_blackjack_description:
        'Play Blackjack ("Siebzehn und Vier") against the computer with "real" card decks!',
    command_blackjack_argStake: "stake",
    command_blackjack_argStakeDescription: "The amount of 🪙 to stake.",
    command_buyItem_name: "buyitem",
    command_buyItem_description:
        "Unlocks the item with the given name in exchange for your 🪙.",
    command_buyItem_argItem: "item",
    command_buyItem_argItemDescription: "The name or item ID",
    ownedItems_error_noItemsOwnedTitle: "No items found!",
    ownedItems_error_noItemsOwnedDescription:
        "It seems like you don't own any items... sadge.",
    unownedItems_error_allItemsOwnedTitle: "No unowned items!",
    unownedItems_error_allItemsOwnedDescription:
        "You seem to have every item currently available!",
    command_inventory_name: "inventory",
    command_inventory_description:
        "Lists all your owned items, and allows for easy equipping.",
    inventory_reply_title: "This is your inventory.",
    inventory_reply_description:
        "Click the buttons below to equip or unequip / use your items.",
    command_useItem_name: "useitem",
    command_useItem_description:
        "Performs the use action on an item - if you own it! (e.g. equipping a role)",
    command_useItem_argItem: "item",
    command_useItem_argItemDescription: "The name or item ID",
    command_listAll_name: "listall",
    command_listAll_description: "Lists all items that are registered.",
    command_listAll_argPage: "page",
    command_listAll_argPageDescription: "The page number to show.",
    listAll_reply_title: "All available items",
    command_shop_name: "shop",
    command_shop_description: "Lists all items that you haven't unlocked yet.",
    shop_reply_title: "The Shop",
    shop_reply_description: "Purchase any missing items here!",
    isValidStake_error_invalidStakeTitle: "Invalid stake",
    isValidStake_error_invalidStakeDescription:
        "Your stake must be between $minStake and $maxStake. Your stake: $stake",
    findItem_error_invalidInputTitle: "Invalid item name",
    findItem_error_invalidInputDescription:
        "That is not a valid item ID nor a valid item name.",
    findItem_error_notFoundTitle: "Item not found",
    findItem_error_notFoundDescription:
        "Your query $query couldn't be resolved into any known items.",
    useItem_error_notUnlockedTitle: "Not unlocked",
    useItem_error_notUnlockedDescription: "You do not own the item $item.",
    useItem_error_roleNotFoundTitle: "Role not found",
    useItem_error_roleNotFoundDescription:
        "I couldn't retrieve the role associated with this item. Was it deleted?",
    useItem_error_unexpectedAPIResponseTitle: "Unexpected response",
    useItem_error_unexpectedAPIResponseDescription:
        "Discord answered with a weird API object that I don't wanna deal with. Sorry.",
    useItem_reply_roleRemovedTitle: "Role removed",
    useItem_reply_roleRemovedDescription:
        "I've removed your unlocked role $role.",
    useItem_error_roleRemovalFailedTitle: "Couldn't remove role",
    useItem_error_roleRemovalFailedDescription:
        "I couldn't remove the role from you. I might not have the permissions to do so.",
    useItem_reply_roleAddedTitle: "Role added",
    useItem_reply_roleAddedDescription:
        "I've assigned you your unlocked role $role.",
    useItem_error_roleAdditionFailedTitle: "Couldn't assign role",
    useItem_error_roleAdditionFailedDescription:
        "I couldn't assign the role to you. I might not have the permissions to do so.",
    unlockItem_error_alreadyOwnedTitle: "Already owned",
    unlockItem_error_alreadyOwnedDescription: "You already own the item $item.",
    unlockItem_error_insufficientBalanceTitle: "Not enough funds!",
    unlockItem_error_insufficientBalanceDescription:
        "You cannot afford $item! It costs $value 🪙, but you only have $balance 🪙.",
    unlockItem_error_unknownErrorTitle: "Something went horribly wrong...",
    unlockItem_error_unknownErrorDescription:
        "Something went wrong while trying to give you this item. Feel free to yell at my creator.",
    unlockItem_reply_unlockedTitle: "Item unlocked!",
    unlockItem_reply_unlockedDescription:
        "You have unlocked the item $item for $value 🪙!\n~~$oldBalance~~ -> **$newBalance** 🪙",
    adminPerms_error_unknownTitle: "Couldn't determine access",
    adminPerms_error_unknownDescription:
        "I'm not sure if you're allowed to run this command...",
    adminPerms_error_notAllowedTitle: "No permission",
    adminPerms_error_notAllowedDescription:
        "You're not allowed to use this command.",
    command_sendMenu_name: "sendmenu",
    command_sendMenu_description:
        "🔧 Sends the main interaction menu publicly in this channel, unless specified.",
    command_sendMenu_argChannel: "channel",
    command_sendMenu_argChannelDescription:
        "🔧 If set, the channel that the menu message will be sent in.",
    menu_entryPoint_title: "Alley Cats Gaming Bot",
    menu_entryPoint_description: "Made with ♥️ by Salem and Niklas",
    menu_entryPoint_buttonLabel: "Enter Lobby",
    menu_error_unknownInteractionTitle: "Something went wrong",
    menu_error_unknownInteractionDescription:
        "The menu interaction failed because I can't recognize its ID. sorry.",
    menu_text_back: "Back",
    menu_text_stakeDescription: "Choose an amount to stake",
    mainMenu_text_title: "Main Menu",
    mainMenu_text_description: "Select to continue",
    mainMenu_button_games: "Games",
    mainMenu_button_profile: "Profile",
    mainMenu_button_shop: "Shop",
    mainMenu_button_about: "About Colby",
    gamesMenu_text_title: "Games",
    gamesMenu_text_description: "What would you like to play?",
    gamesMenu_button_blackjack: "Blackjack",
    gamesMenu_button_slots: "Slots",
    gamesMenu_button_drawCard: "Draw a card",
    profileMenu_text_title: "Profile",
    profileMenu_text_description: "This is your profile.",
    profileMenu_field_balanceName: "Your balance",
    profileMenu_field_balanceValue: "$balance 🪙",
    profileMenu_field_birthdayName: "Birthday",
    profileMenu_button_daily: "Daily claim",
    profileMenu_button_inventory: "Open inventory",
    profileMenu_button_getLoan: "Losses claim (<25 🪙)",
    profileMenu_button_setBirthday: "Set birthday",
    command_enter_name: "enter",
    command_enter_description: "Opens the main menu for you.",
    getLoan_reply_rejectedTitle: [
        "Still too successful",
        "Not enough of a loser",
        "You're too rich",
        "Need less 🪙",
    ],
    getLoan_reply_rejectedDescription: [
        "Sorry, we don't find it financially viable to chase down insignificant gambling addict losses. We suggest you " +
            "call a hotline and wish you the best.",

        "You may know that you have rights, but I also have the right to reject this application. You wouldn't make me " +
            "enough money with that much still in your bank. Sorry.",

        "Hey, what's a gambling whale doing in my office? Get out! I have more serious cases to deal with. Come back " +
            "when you've got a _real_ problem on your grubby paws.",
    ],
    getLoan_reply_acceptedTitle: [
        "Losses recuperated!",
        "Settled out of court!",
        "Here's your losses back.",
    ],
    getLoan_reply_acceptedDescription: [
        "Baa Goodman here. We fought those rat bastards tooth and nail to get you your money back, but unfortunately " +
            "they have actual lawyers and judges! Those scare the shit out of me. Thankfully, they don't care much for " +
            "smallfry like you, so they settled out of court for $value 🪙! ...well, actually, it was $fakeValue 🪙, " +
            "but you agreed to my terms and the cut that gets me. Thank you for trusting Baa Humbug. See you around.",

        "Hey, this is Baa Goodman, your favorite representative of Baa Humbug. We took those sons of bitches to court " +
            "to make sure you can keep gambling your life savings away. Turns out they have a much stronger legal defense " +
            "than you do! But who needs a strong defense when you've got me on your side. I got them to cough up " +
            "$fakeValue 🪙 of your retirement funds. So, as agreed, 65%-ish of that are mine - " +
            "here are your remaining $value 🪙.",

        "Hi, Baa Goodman, representative of Baa Humbug, how you doing? I fought your case against those gambling " +
            "sharks for you. Can tell you, wasn't easy, those slimy CEOs have some mean left hooks and some even meaner " +
            "lawyers. But what kind of attorney would I be if I didn't win those? ...don't answer that, actually. " +
            "I settled with them. Here's your $value 🪙. I took my cut out of your winnings of $fakeValue 🪙 already, no " +
            "need to do the math yourself. And if you run out of your insurance claims again, you know who to call.",
    ],
    command_setBirthday_name: "birthday",
    command_setBirthday_description: "Let Colby remember your birthday!",
    modal_birthday_title: "Enter your birthday",
    modal_birthday_dayLabel: "Day",
    modal_birthday_monthLabel: "Month (number, please!)",
    modal_birthday_yearLabel: "Year (optional)",
    birthday_error_parseFailureTitle: "Invalid value specified",
    birthday_error_parseFailureDescription:
        "The values you've given me failed to parse - please make sure you supply all values as numbers.",
    birthday_error_invalidDateTitle: "Invalid date specified",
    birthday_error_invalidDateDescription:
        "The date you've supplied either is in the future or does not exist. Remember - you don't have to supply a year if you don't want to!",
    birthday_error_alreadySetTitle: "Birthday already set",
    birthday_error_alreadySetDescription:
        "You've already set your birthday with me! You can't change that by yourself. If you need something fixed, poke someone :3c",
    birthday_reply_setTitle: "Birthday registered!",
    birthday_reply_setDescription: "I will remember your birthday as $birthday",
    birthday_format_noneSet: "None set!",

    publicBirthday_message_header: "Happy birthday!",
    publicBirthday_message_body: "I have yet to add a translation here lemayo",

    about_header_title: "About Colby Jack",
    about_header_description:
        "Since Colby Jack can store some of your personal data (specifically, your birthday), here's the important but " +
        "boring privacy disclaimer:\n\n" +
        "**We do not use your personal data for _anything_ but the actual operation of Colby Jack.** Full stop.\n" +
        "Right now, it only affects what's shown in your profile, and the amount of coins you get when doing your daily claim.\n" +
        "I plan to add a fun little thing that counts down to your birthday, but that is it. The data _is_ associated " +
        "with your discord ID, obviously - but it will never leave the server Colby Jack is hosted on, and I will never " +
        "sell or transfer any of your data to any third party. No messages are read nor stored, and if you wish to do " +
        "so, you may at any time have your birthday removed from the database, no questions asked. I'll probably add a " +
        "button to do so eventually, but for now, please, just send me (Niklas) a message. I will take care of it post-haste.",
};
