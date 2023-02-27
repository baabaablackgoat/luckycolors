import { ButtonInteraction } from "discord.js";
import { useItemHandler } from "../handlers/UseItemHandler.js";
import { unlockItemHandler } from "../handlers/UnlockItemHandler.js";

function getItemID(customID: string): string {
    return customID.split("_")[1];
}

export class ButtonHandler {
    static async equip(interaction: ButtonInteraction) {
        void useItemHandler(interaction, getItemID(interaction.customId));
    }
    static async unlock(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        void unlockItemHandler(interaction, getItemID(interaction.customId));
    }
    static async remove(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const itemID = getItemID(interaction.customId);
        // TODO
        await interaction.editReply(
            `todo: revoke item ID ${itemID}, coming soon i swear`
        );
    }
    static async page(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        // TODO: pages need to be implemented still aaa
        await interaction.editReply(`coming soon I swear`);
    }
}
