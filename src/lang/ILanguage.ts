export type RandomizedTranslation = string[];
// TODO: This, in theory, should be extended in such a way that absolutely enforces lowercase-no-special-character strings.
type CommandParameterName = Lowercase<string>;
type TranslationValue = string | RandomizedTranslation | CommandParameterName;

export interface ILanguage {
    // Daily claim command
    command_daily_name: CommandParameterName;
    command_daily_description: TranslationValue;
    daily_error_alreadyClaimedTitle: TranslationValue;
    daily_error_alreadyClaimedDescription: TranslationValue;
    daily_reply_claimedTitle: TranslationValue;
    daily_reply_claimedDescription: TranslationValue;
    // Ping command
    command_ping_name: CommandParameterName;
    command_ping_description: TranslationValue;
    ping_reply_text: TranslationValue;
    // Adding role item command
    command_addRole_name: CommandParameterName;
    command_addRole_description: TranslationValue;
    command_addRole_argItemName: CommandParameterName;
    command_addRole_argItemNameDescription: TranslationValue;
    command_addRole_argRole: CommandParameterName;
    command_addRole_argRoleDescription: TranslationValue;
    command_addRole_argCost: CommandParameterName;
    command_addRole_argCostDescription: TranslationValue;
    // checkBalance command
    command_checkBalance_name: CommandParameterName;
    command_checkBalance_description: TranslationValue;
    command_checkBalance_argTargetUser: CommandParameterName;
    command_checkBalance_argTargetUserDescription: TranslationValue;
    checkBalance_reply_title: TranslationValue;
    checkBalance_reply_description: TranslationValue;
    // setBalance command
    command_setBalance_name: CommandParameterName;
    command_setBalance_description: TranslationValue;
    command_setBalance_argTargetUser: CommandParameterName;
    command_setBalance_argTargetUserDescription: TranslationValue;
    command_setBalance_argAmount: CommandParameterName;
    command_setBalance_argAmountDescription: TranslationValue;
    setBalance_error_invalidAmountTitle: TranslationValue;
    setBalance_error_invalidAmountDescription: TranslationValue;
    setBalance_reply_successTitle: TranslationValue;
    setBalance_reply_successDescription: TranslationValue;
    // Add balance command
    command_addBalance_name: CommandParameterName;
    command_addBalance_description: TranslationValue;
    command_addBalance_argTargetUser: CommandParameterName;
    command_addBalance_argTargetUserDescription: TranslationValue;
    command_addBalance_argAmount: CommandParameterName;
    command_addBalance_argAmountDescription: TranslationValue;
    addBalance_error_invalidAmountTitle: TranslationValue;
    addBalance_error_invalidAmountDescription: TranslationValue;
    addBalance_reply_successTitle: TranslationValue;
    addBalance_reply_successDescription: TranslationValue;
    // Subtract balance command
    command_subtractBalance_name: CommandParameterName;
    command_subtractBalance_description: TranslationValue;
    command_subtractBalance_argTargetUser: CommandParameterName;
    command_subtractBalance_argTargetUserDescription: TranslationValue;
    command_subtractBalance_argAmount: CommandParameterName;
    command_subtractBalance_argAmountDescription: TranslationValue;
    subtractBalance_error_invalidAmountTitle: TranslationValue;
    subtractBalance_error_invalidAmountDescription: TranslationValue;
    subtractBalance_error_insufficientBalanceTitle: TranslationValue;
    subtractBalance_error_insufficientBalanceDescription: TranslationValue;
    subtractBalance_reply_successTitle: TranslationValue;
    subtractBalance_reply_successDescription: TranslationValue;
    // generic item addition replies
    addItem_error_invalidCostTitle: TranslationValue;
    addItem_error_invalidCostDescription: TranslationValue;
    addItem_error_invalidNameTitle: TranslationValue;
    addItem_error_invalidNameDescription: TranslationValue;
    addItem_error_unexpectedResponseTitle: TranslationValue;
    addRole_error_passedRoleObjectInvalid: TranslationValue;
    addRole_error_roleTooStrongTitle: TranslationValue;
    addRole_error_roleTooStrongDescription: TranslationValue;
    addRole_error_unknownTitle: TranslationValue;
    addRole_error_unknownDescription: TranslationValue;
    addRole_created_title: TranslationValue;
    addRole_created_description: TranslationValue;
    itemView_ownedItem: TranslationValue;
    itemView_unlockItem: TranslationValue;
    itemView_removeItem: TranslationValue;
    itemView_prevPage: TranslationValue;
    itemView_nextPage: TranslationValue;
    // Card command
    command_card_name: CommandParameterName;
    command_card_description: TranslationValue;
    card_reply_title: TranslationValue;
    card_reply_description: TranslationValue;
    card_button_drawAgain: TranslationValue;
    card_error_deckMissingTitle: TranslationValue;
    card_error_deckMissingDescription: TranslationValue;
    // Blackjack
    blackjack_printHands_dealerHand: TranslationValue;
    blackjack_printHands_playerHand: TranslationValue;
    blackjack_button_hit: TranslationValue;
    blackjack_button_stand: TranslationValue;
    blackjack_button_doubleDown: TranslationValue;
    blackjack_text_yourTurn: TranslationValue;
    blackjack_text_dealerTurn: TranslationValue;
    blackjack_text_blackjackWin: TranslationValue;
    blackjack_text_win: TranslationValue;
    blackjack_text_tied: TranslationValue;
    blackjack_text_bust: TranslationValue;
    blackjack_text_lost: TranslationValue;
    blackjack_reply_title: TranslationValue;
    blackjack_error_gameCancelledTitle: TranslationValue;
    blackjack_error_gameCancelledDescription: TranslationValue;
    blackjack_error_invalidInteractionTitle: TranslationValue;
    blackjack_error_invalidInteractionDescription: TranslationValue;
    blackjack_error_insufficientBalanceTitle: TranslationValue;
    blackjack_error_insufficientBalanceDescription: TranslationValue;
    command_blackjack_name: CommandParameterName;
    command_blackjack_description: TranslationValue;
    command_blackjack_argStake: CommandParameterName;
    command_blackjack_argStakeDescription: TranslationValue;
    // buy item command
    command_buyItem_name: CommandParameterName;
    command_buyItem_description: TranslationValue;
    command_buyItem_argItem: CommandParameterName;
    command_buyItem_argItemDescription: TranslationValue;
    // owned & unowned item reply list errors
    ownedItems_error_noItemsOwnedTitle: TranslationValue;
    ownedItems_error_noItemsOwnedDescription: TranslationValue;
    unownedItems_error_allItemsOwnedTitle: TranslationValue;
    unownedItems_error_allItemsOwnedDescription: TranslationValue;
    // inventory command
    command_inventory_name: CommandParameterName;
    command_inventory_description: TranslationValue;
    inventory_reply_title: TranslationValue;
    inventory_reply_description: TranslationValue;
    // useItem command
    command_useItem_name: CommandParameterName;
    command_useItem_description: TranslationValue;
    command_useItem_argItem: CommandParameterName;
    command_useItem_argItemDescription: TranslationValue;
    // listAllItems command
    command_listAll_name: CommandParameterName;
    command_listAll_description: TranslationValue;
    command_listAll_argPage: CommandParameterName;
    command_listAll_argPageDescription: TranslationValue;
    listAll_reply_title: TranslationValue;
    // shop command
    command_shop_name: CommandParameterName;
    command_shop_description: TranslationValue;
    shop_reply_title: TranslationValue;
    shop_reply_description: TranslationValue;
    // isValidStake: error state
    isValidStake_error_invalidStakeTitle: TranslationValue;
    isValidStake_error_invalidStakeDescription: TranslationValue;
    // findItem: error states
    findItem_error_invalidInputTitle: TranslationValue;
    findItem_error_invalidInputDescription: TranslationValue;
    findItem_error_notFoundTitle: TranslationValue;
    findItem_error_notFoundDescription: TranslationValue;
}
