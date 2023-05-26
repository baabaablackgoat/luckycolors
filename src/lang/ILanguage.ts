export type RandomizedTranslation = string[];
type TranslationValue = string | RandomizedTranslation;
export interface ILanguage {
    command_addRole_name: TranslationValue;
    command_addRole_description: TranslationValue;
    command_addRole_argItemName: TranslationValue;
    command_addRole_argItemNameDescription: TranslationValue;
    command_addRole_argRole: TranslationValue;
    command_addRole_argRoleDescription: TranslationValue;
    command_addRole_argCost: TranslationValue;
    command_addRole_argCostDescription: TranslationValue;
    // checkBalance command
    command_checkBalance_name: TranslationValue;
    command_checkBalance_description: TranslationValue;
    command_checkBalance_argTargetUser: TranslationValue;
    command_checkBalance_argTargetUserDescription: TranslationValue;
    checkBalance_reply_title: TranslationValue;
    checkBalance_reply_description: TranslationValue;
    // setBalance command
    command_setBalance_name: TranslationValue;
    command_setBalance_description: TranslationValue;
    command_setBalance_argTargetUser: TranslationValue;
    command_setBalance_argTargetUserDescription: TranslationValue;
    command_setBalance_argAmount: TranslationValue;
    command_setBalance_argAmountDescription: TranslationValue;
    setBalance_error_invalidAmountTitle: TranslationValue;
    setBalance_error_invalidAmountDescription: TranslationValue;
    setBalance_reply_successTitle: TranslationValue;
    setBalance_reply_successDescription: TranslationValue;
    // Add balance command
    command_addBalance_name: TranslationValue;
    command_addBalance_description: TranslationValue;
    command_addBalance_argTargetUser: TranslationValue;
    command_addBalance_argTargetUserDescription: TranslationValue;
    command_addBalance_argAmount: TranslationValue;
    command_addBalance_argAmountDescription: TranslationValue;
    addBalance_error_invalidAmountTitle: TranslationValue;
    addBalance_error_invalidAmountDescription: TranslationValue;
    addBalance_reply_successTitle: TranslationValue;
    addBalance_reply_successDescription: TranslationValue;
    // Subtract balance command
    command_subtractBalance_name: TranslationValue;
    command_subtractBalance_description: TranslationValue;
    command_subtractBalance_argTargetUser: TranslationValue;
    command_subtractBalance_argTargetUserDescription: TranslationValue;
    command_subtractBalance_argAmount: TranslationValue;
    command_subtractBalance_argAmountDescription: TranslationValue;
    subtractBalance_error_invalidAmountTitle: TranslationValue;
    subtractBalance_error_invalidAmountDescription: TranslationValue;
    subtractBalance_error_insufficientBalanceTitle: TranslationValue;
    subtractBalance_error_insufficientBalanceDescription: TranslationValue;
    subtractBalance_reply_successTitle: TranslationValue;
    subtractBalance_reply_successDescription: TranslationValue;

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
}
