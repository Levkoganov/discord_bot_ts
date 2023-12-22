import {
  APIInteractionDataResolvedGuildMember,
  CommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  Role,
} from "discord.js";
import champion_sh from "../../models/champion_sh";

export default async (
  interaction: CommandInteraction,
  prevChampionId: string | undefined,
  role: Role,
  championMember: GuildMember | APIInteractionDataResolvedGuildMember | null
): Promise<void> => {
  const numberOfTitles = await champion_sh.countDocuments({
    userId: prevChampionId,
  });

  if (numberOfTitles < 1 && prevChampionId !== undefined) {
    const prevChampion = await interaction.guild?.members.fetch(prevChampionId);
    prevChampion?.roles.remove(role);
  }

  (championMember?.roles as GuildMemberRoleManager).add(role);
};
