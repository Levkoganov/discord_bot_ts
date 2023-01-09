import {
  APIInteractionDataResolvedChannel,
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import channel_sh from "../models/channel_sh";

export = {
  data: new SlashCommandBuilder()
    .setName("set-channel")
    .setDescription("setting channel leaderboards")

    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select KOTH / Rank")
        .setRequired(true)
        .addChoices({
          name: "KOTH",
          value: "KOTH",
        })
        .addChoices({
          name: "Rank",
          value: "Rank",
        })
    )

    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("pick a channel")
        .setRequired(true)
    ),

  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const moderatorsRoleName = "Moderators";
    const isAdmin = interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    const isMod = interaction.member.roles.cache.some(
      (role) => role.name === moderatorsRoleName
    );

    const channel = interaction.options.getChannel("channel", true);
    const type = interaction.options.getString("type", true);

    if (channel.type !== 0) {
      await interaction.reply({
        content: "Please select a: `text channel`",
        ephemeral: true,
      });
      return;
    }

    if (isAdmin || isMod) {
      const { id } = interaction.guild;
      const isChannelSet = await setChannel(id, type, channel);

      if (isChannelSet) {
        await interaction.reply({
          content: `\`${channel.name}\` channel is set as \`${type}\` leaderboards`,
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

async function setChannel(
  guildId: string,
  type: string,
  channel: TextChannel | APIInteractionDataResolvedChannel
): Promise<boolean> {
  const { id, name } = channel;
  const filter = { guildId: guildId, type: type };
  const update = {
    guildId: guildId,
    channelId: id,
    type: type,
    channelName: name,
  };
  const option = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  const channlData = await channel_sh.findOne({
    guildId: guildId,
    channelName: name,
  });

  if (channlData !== null && channlData.type !== type) {
    return false;
  }

  await channel_sh.findOneAndUpdate(filter, update, option);
  return true;
}
