import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { findItem } from "../def/FindItem.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";

export async function useItemHandler(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    itemQuery: string
) {
    await interaction.deferReply({ ephemeral: true });
    const foundItem = await findItem(interaction, itemQuery);
    if (foundItem === null) return;
    if (
        !(await DataStorage.checkItemOwnership(
            interaction.user.id,
            foundItem.itemID
        ))
    ) {
        await replyWithEmbed(
            interaction,
            "Not unlocked",
            `You do not own the item ${foundItem.itemName}.`,
            "warn",
            interaction.user,
            true
        );
        return;
    }
    if (foundItem.itemType === "role") {
        const foundRole = await interaction.guild.roles
            .fetch(foundItem.itemData.roleID)
            .catch(async (err) => {
                console.error(
                    `Couldn't fetch role with id ${foundItem.itemData.roleID}`,
                    err
                );
            });
        if (!foundRole) {
            await replyWithEmbed(
                interaction,
                "Something went wrong...",
                "I couldn't retrieve the role associated with this item. Was it deleted?",
                "error",
                interaction.user,
                true
            );
            return;
        }
        if (!(interaction.member instanceof GuildMember)) {
            await replyWithEmbed(
                interaction,
                "Something went wrong...",
                "Discord answered with a weird API object that I don't wanna deal with. Sorry :P",
                "error",
                interaction.user,
                true
            );
            return;
        }
        if (interaction.member.roles.cache.has(foundRole.id)) {
            // Member has role - remove it
            interaction.member.roles
                .remove(foundRole)
                .then(async () => {
                    await replyWithEmbed(
                        interaction,
                        "Role removed",
                        `I've removed your unlocked role ${foundRole.name}.`,
                        "info",
                        interaction.user,
                        true
                    );
                })
                .catch(async (err) => {
                    console.error("Failed to remove role from member", err);
                    await replyWithEmbed(
                        interaction,
                        "Couldn't remove role.",
                        "I couldn't remove the role from you. I might not have the permissions to do so.",
                        "error",
                        interaction.user,
                        true
                    );
                });
            return;
        } else {
            // Member does not have role - add
            interaction.member.roles
                .add(foundRole)
                .then(async () => {
                    await replyWithEmbed(
                        interaction,
                        "Role added",
                        `I've assigned you your unlocked role ${foundRole.name}.`,
                        "info",
                        interaction.user,
                        true
                    );
                })
                .catch(async (err) => {
                    console.error("Failed to assign role to member", err);
                    await replyWithEmbed(
                        interaction,
                        "Couldn't assign role.",
                        "I couldn't assign the role to you. I might not have the permissions to do so.",
                        "error",
                        interaction.user,
                        true
                    );
                });
            return;
        }
    }
}
