import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { findItem } from "../def/FindItem.js";
import { DataStorage } from "../def/DatabaseWrapper.js";
import { replyWithEmbed } from "../def/replyWithEmbed.js";
import { Lang } from "../lang/LanguageProvider";

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
            Lang("useItem_error_notUnlockedTitle"),
            Lang("useItem_error_notUnlockedDescription", {
                item: foundItem.itemName,
            }),
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
                Lang("useItem_error_roleNotFoundTitle"),
                Lang("useItem_error_roleNotFoundDescription"),
                "error",
                interaction.user,
                true
            );
            return;
        }
        if (!(interaction.member instanceof GuildMember)) {
            await replyWithEmbed(
                interaction,
                Lang("useItem_error_unexpectedAPIResponseTitle"),
                Lang("useItem_error_unexpectedAPIResponseDescription"),
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
                        Lang("useItem_reply_roleRemovedTitle"),
                        Lang("useItem_reply_roleRemovedDescription", {
                            role: foundRole.name,
                        }),
                        "info",
                        interaction.user,
                        true
                    );
                })
                .catch(async (err) => {
                    console.error("Failed to remove role from member", err);
                    await replyWithEmbed(
                        interaction,
                        Lang("useItem_error_roleRemovalFailedTitle"),
                        Lang("useItem_error_roleRemovalFailedDescription"),
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
                        Lang("useItem_reply_roleAddedTitle"),
                        Lang("useItem_reply_roleAddedDescription", {
                            role: foundRole.name,
                        }),
                        "info",
                        interaction.user,
                        true
                    );
                })
                .catch(async (err) => {
                    console.error("Failed to assign role to member", err);
                    await replyWithEmbed(
                        interaction,
                        Lang("useItem_error_roleAdditionFailedTitle"),
                        Lang("useItem_error_roleAdditionFailedDescription"),
                        "error",
                        interaction.user,
                        true
                    );
                });
            return;
        }
    }
}
