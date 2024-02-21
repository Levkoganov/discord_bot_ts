import {
  APIInteractionDataResolvedChannel,
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import channel_sh from "../models/channel_sh";
import { roleNames } from "../constants/constants";

export = {
  data: new SlashCommandBuilder()
    .setName("set-channel")
    .setDescription("setting channel leaderboards")
    .addChannelOption((option) => option.setName("channel").setDescription("pick a channel").setRequired(true)),

  async execute(interaction: CommandInteraction & GuildMemberRoleManager): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isMod = interaction.member.roles.cache.some((role) => role.name === roleNames.Moderators);
    const channel = interaction.options.getChannel("channel", true);

    if (channel.type !== 0) {
      await interaction.reply({
        content: "Please select a: `text channel`",
        ephemeral: true,
      });
      return;
    }

    if (isAdmin || isMod) {
      const { id } = interaction.guild;
      const isChannelSet = await setChannel(id, channel);

      if (isChannelSet) {
        await interaction.reply({
          content: `\`${channel.name}\` channel is set as \`KOTH\` leaderboards`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `error: \`${channel.name}\` channel is not available`,
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "You dont have permission for this command...",
        ephemeral: true,
      });
    }
  },
};

async function setChannel(guildId: string, channel: TextChannel | APIInteractionDataResolvedChannel): Promise<boolean> {
  const { id, name } = channel;
  const filter = { guildId: guildId };
  const update = {
    guildId: guildId,
    channelId: id,
    channelName: name,
  };
  const option = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  const result = await channel_sh.findOneAndUpdate(filter, update, option);
  if (result === null) {
    return false;
  } else {
    return true;
  }
}
