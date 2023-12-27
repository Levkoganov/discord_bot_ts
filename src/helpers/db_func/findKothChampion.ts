import { CommandInteraction } from "discord.js";
import champion_sh from "../../models/champion_sh";

export const findKothChampion = async (game: string, interaction: CommandInteraction) => {
  if (interaction.guild === null) return;

  const champion = await champion_sh.findOne({ game });
  if (champion) {
    const { user } = await interaction.guild.members.fetch(champion.userId);
    return user;
  }
};
