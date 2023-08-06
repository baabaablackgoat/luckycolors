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
    blackjack_button_playAgain: TranslationValue;
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
    // enter command
    command_enter_name: CommandParameterName;
    command_enter_description: TranslationValue;

    // isValidStake: error state
    isValidStake_error_invalidStakeTitle: TranslationValue;
    isValidStake_error_invalidStakeDescription: TranslationValue;
    // findItem: error states
    findItem_error_invalidInputTitle: TranslationValue;
    findItem_error_invalidInputDescription: TranslationValue;
    findItem_error_notFoundTitle: TranslationValue;
    findItem_error_notFoundDescription: TranslationValue;
    // useItem translations
    useItem_error_notUnlockedTitle: TranslationValue;
    useItem_error_notUnlockedDescription: TranslationValue;
    useItem_error_roleNotFoundTitle: TranslationValue;
    useItem_error_roleNotFoundDescription: TranslationValue;
    useItem_error_unexpectedAPIResponseTitle: TranslationValue;
    useItem_error_unexpectedAPIResponseDescription: TranslationValue;
    useItem_reply_roleRemovedTitle: TranslationValue;
    useItem_reply_roleRemovedDescription: TranslationValue;
    useItem_error_roleRemovalFailedTitle: TranslationValue;
    useItem_error_roleRemovalFailedDescription: TranslationValue;
    useItem_reply_roleAddedTitle: TranslationValue;
    useItem_reply_roleAddedDescription: TranslationValue;
    useItem_error_roleAdditionFailedTitle: TranslationValue;
    useItem_error_roleAdditionFailedDescription: TranslationValue;
    // unlockItem translations
    unlockItem_error_alreadyOwnedTitle: TranslationValue;
    unlockItem_error_alreadyOwnedDescription: TranslationValue;
    unlockItem_error_insufficientBalanceTitle: TranslationValue;
    unlockItem_error_insufficientBalanceDescription: TranslationValue;
    unlockItem_error_unknownErrorTitle: TranslationValue;
    unlockItem_error_unknownErrorDescription: TranslationValue;
    unlockItem_reply_unlockedTitle: TranslationValue;
    unlockItem_reply_unlockedDescription: TranslationValue;
    // permission assertion
    adminPerms_error_unknownTitle: TranslationValue;
    adminPerms_error_unknownDescription: TranslationValue;
    adminPerms_error_notAllowedTitle: TranslationValue;
    adminPerms_error_notAllowedDescription: TranslationValue;
    // Menu translations
    command_sendMenu_name: CommandParameterName;
    command_sendMenu_description: TranslationValue;
    command_sendMenu_argChannel: CommandParameterName;
    command_sendMenu_argChannelDescription: TranslationValue;
    menu_entryPoint_title: TranslationValue;
    menu_entryPoint_description: TranslationValue;
    menu_entryPoint_buttonLabel: TranslationValue;
    menu_error_unknownInteractionTitle: TranslationValue;
    menu_error_unknownInteractionDescription: TranslationValue;

    // generic menu entries
    menu_text_back: TranslationValue;
    menu_text_stakeDescription: TranslationValue;
    // main menu
    mainMenu_text_title: TranslationValue;
    mainMenu_text_description: TranslationValue;
    mainMenu_button_games: TranslationValue;
    mainMenu_button_balance: TranslationValue;
    mainMenu_button_shop: TranslationValue;
    // games menu
    gamesMenu_text_title: TranslationValue;
    gamesMenu_text_description: TranslationValue;
    gamesMenu_button_blackjack: TranslationValue;
    gamesMenu_button_slots: TranslationValue;
    gamesMenu_button_drawCard: TranslationValue;
    // balance menu
    balanceMenu_text_title: TranslationValue;
    balanceMenu_text_description: TranslationValue;
    balanceMenu_button_daily: TranslationValue;
    balanceMenu_button_inventory: TranslationValue;
    balanceMenu_button_getLoan: TranslationValue;

    // loan (haha) translations
    getLoan_reply_rejectedTitle: TranslationValue;
    getLoan_reply_rejectedDescription: TranslationValue;
}
