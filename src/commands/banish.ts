import {
  SlashCommandBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
} from "discord.js";
import { roleNames } from "../constants/constants";

export = {
  data: new SlashCommandBuilder()
    .setName("banish")
    .setDescription("Choose someone to banish")
    .addUserOption((option) =>
      option.setName("victim").setDescription("Choose your victim").setRequired(true)
    ),

  async execute(interaction: CommandInteraction & GuildMemberRoleManager): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const banisher = interaction.user;
    const victim = interaction.options.getUser("victim", true);

    const role = interaction.guild.roles.cache.find((role) => role.name === roleNames.Banisher);
    const hasRole = interaction.member.roles.cache.some((role) => role.name === roleNames.Banisher);

    // Check if user has "role"
    if (hasRole && role) {
      const banisherMember = interaction.guild.members.cache.get(banisher.id);
      const victimMember = interaction.guild.members.cache.get(victim.id);

      victimMember?.timeout(3 * 60 * 1000); // 3min
      banisherMember?.roles.remove(role);

      await interaction.reply({
        content: `\`\`\`${banisher.username} has banished ${victim.username} from the server! ᕦ(ò_óˇ)ᕤ\nAchieve victory in the shadow game match to unlock this power!\`\`\``,
      });
    } else {
      await interaction.reply({
        content: `\`\`\`You can banish someone only after winning a shadowgame match!\`\`\``,
        ephemeral: true,
      });
    }
  },
};
