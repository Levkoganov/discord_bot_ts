import {
  APIInteractionDataResolvedChannel,
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import kothChannel_sh from "../models/kothChannel_sh";

export = {
  data: new SlashCommandBuilder()
    .setName("set-koth-channel")
    .setDescription("KOTH Leaderboard")

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

    if (channel.type !== 0) {
      await interaction.reply({
        content: "Please select a: `text channel`",
        ephemeral: true,
      });
      return;
    }

    if (isAdmin || isMod) {
      const { id } = interaction.guild;
      const isKothChannelSet = await setKothChannel(id, channel);

      if (isKothChannelSet) {
        await interaction.reply({
          content: `KOTH leaderboard channel: \`${channel.name}\``,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `unexpected error`,
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

async function setKothChannel(
  guildId: string,
  channel: TextChannel | APIInteractionDataResolvedChannel
): Promise<boolean> {
  const { id, name } = channel;
  const filter = { _id: guildId };
  const update = {
    _id: guildId,
    channelId: id,
    channelName: name,
  };
  const option = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  try {
    const kothChannel = await kothChannel_sh.findOneAndUpdate(
      filter,
      update,
      option
    );
    return kothChannel ? true : false;
  } catch (error) {
    console.error(`couldn't set kothChannel: ${error}`);
    return false;
  }
}
