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
};
