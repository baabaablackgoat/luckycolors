import { ILanguage } from "./ILanguage.js";
export const english: ILanguage = {
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
};
