import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";

export default async (
  user: GuildMember | undefined,
  roleName: string,
  interaction: CommandInteraction & GuildMemberRoleManager
): Promise<void> => {
  const role = interaction.guild.roles.cache.find((role) => role.name === roleName);
  if (role) await user?.roles.add(role);
};
