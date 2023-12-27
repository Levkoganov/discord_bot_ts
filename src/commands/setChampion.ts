import { CommandInteraction, GuildMemberRoleManager, PermissionsBitField, SlashCommandBuilder, TextChannel } from "discord.js";
import channel_sh from "../models/channel_sh";
import updateKothRole from "../helpers/db_func/updateKothRole";
import findAndUpdateChampion from "../helpers/db_func/findAndUpdateChampion";
import updateKothLeaderboardChannel from "../helpers/db_func/updateLeaderboardChannel";
import { gamesOption } from "../constants/gameOptionsFunc";
import { findAndUpdateGameHigestWinstreak } from "../helpers/db_func/findAndUpdateGameHigestWinstreak";

export = {
  data: new SlashCommandBuilder()
    .setName("set-champion")
    .setDescription("setting new koth champion")
    .addStringOption((option) => gamesOption(option))
    .addUserOption((option) => option.setName("new-champion").setDescription("select new champion").setRequired(true)),

  async execute(interaction: CommandInteraction & GuildMemberRoleManager): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const game = interaction.options.getString("game", true);
    const newChampion = interaction.options.getUser("new-champion", true);
    const championMember = interaction.guild.members.cache.get(newChampion.id);
    const { id } = interaction.guild;
    const moderatorsRoleName = "Moderators";
    const kothRoleName = "KOTH - Champion";

    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isMod = interaction.member.roles.cache.some((role) => role.name === moderatorsRoleName);

    if (isAdmin || isMod) {
      const kothLeaderboardChannel = await channel_sh.findOne({ guildId: id });

      if (kothLeaderboardChannel === null) {
        await interaction.reply({
          content: `Please use \`/set-channel\` before using this command`,
          ephemeral: true,
        });
        return;
      }

      const role = interaction.guild.roles.cache.find((role) => role.name === kothRoleName);

      if (role === undefined) {
        await interaction.reply({
          content: `Please create \`"KOTH - Champion"\` **__role__** before using this command`,
          ephemeral: true,
        });
        return;
      }

      const prevChampion = await findAndUpdateChampion(game, newChampion);
      const { channelId } = kothLeaderboardChannel;
      const channel = interaction.guild.channels.cache.get(channelId) as TextChannel;

      await findAndUpdateGameHigestWinstreak(game, newChampion);
      await updateKothRole(interaction, role, championMember, prevChampion?.userId);
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
