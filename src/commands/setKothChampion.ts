import {
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import kothChannel_sh from "../models/kothChannel_sh";
import updateKothRole from "../services/updateKothRole";
import findAndUpdateChampion from "../services/findAndUpdateChampion";
import updateKothLeaderboardChannel from "../services/updateKothLeaderboardChannel";

export = {
  data: new SlashCommandBuilder()
    .setName("set-koth-champion")
    .setDescription("setting new koth champion")

    // Select game
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select game")
        .setRequired(true)
        .addChoices({
          name: "Dragonball FighterZ",
          value: "Dragonball_FighterZ",
        })
        .addChoices({
          name: "GG Strive",
          value: "GG_Strive",
        })
        .addChoices({
          name: "DNF Duel",
          value: "DNF_Duel",
        })
        .addChoices({
          name: "Tekken7",
          value: "Tekken7",
        })
        .addChoices({
          name: "Guilty Gear Xrd Rev 2",
          value: "Guilty_Gear_Xrd_Rev_2",
        })
        .addChoices({
          name: "BlazBlue CF",
          value: "BlazBlue_CF",
        })
        .addChoices({
          name: "MultiVersus",
          value: "MultiVersus",
        })
        .addChoices({
          name: "Brawlhalla",
          value: "Brawlhalla",
        })
        .addChoices({
          name: "Street Fighter V",
          value: "Street_Fighter_V",
        })
    )

    .addUserOption((option) =>
      option
        .setName("new-champion")
        .setDescription("select new champion")
        .setRequired(true)
    ),

  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const game = interaction.options.getString("game", true);
    const championMember = interaction.options.getMember("new-champion");
    const newChampion = interaction.options.getUser("new-champion", true);
    const { id } = interaction.guild;

    const moderatorsRoleName = "Moderators";
    const kothRoleName = "KOTH - Champion";

    const isAdmin = interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );
    const isMod = interaction.member.roles.cache.some(
      (role) => role.name === moderatorsRoleName
    );

    if (isAdmin || isMod) {
      const kothLeaderboardChannel = await kothChannel_sh.findById(id);

      if (kothLeaderboardChannel === null) {
        await interaction.reply({
          content: `Please use \`/set-koth-channel\` before using this command`,
          ephemeral: true,
        });
        return;
      }

      const role = interaction.guild.roles.cache.find(
        (role) => role.name === kothRoleName
      );
      if (role === undefined) {
        await interaction.reply({
          content: `Please create \`"KOTH - Champion"\` **__role__** before using this command`,
          ephemeral: true,
        });
        return;
      }

      const prevChampion = await findAndUpdateChampion(game, newChampion);

      await updateKothRole(
        interaction,
        prevChampion?.userId,
        role,
        championMember
      );

      const { channelId } = kothLeaderboardChannel;
      const channel = interaction.guild.channels.cache.get(
        channelId
      ) as TextChannel;

      await updateKothLeaderboardChannel(channel);
      await interaction.reply({
        content: `\`${newChampion.username}\` is the new champion!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "You dont have permission for this command...",
        ephemeral: true,
      });
    }
  },
};
