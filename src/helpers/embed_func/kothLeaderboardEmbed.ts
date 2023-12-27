import { EmbedBuilder } from "discord.js";
import { ISetChampion } from "../../../types";

export default (champions: ISetChampion[]): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor("#C27C0E")
    .setTitle("\u200B")
    .setAuthor({ name: "KOTH Champions" })
    .setImage(`attachment://FGC.png`)
    .setFooter({
      text: "leaderboards last update",
      iconURL: "https://i.imgur.com/AfFp7pu.png",
    })
    .setTimestamp();

  champions.forEach((data) => {
    embed.addFields({
      name: `__${data.game}__`,
      value: `\`\`\`Champion: ${data.username} \nWinstreak: ${data.winstreak} \n\n🥇Highest Winstreak: ${data.highestWinstreak.winstreak} (${data.highestWinstreak.username}) \`\`\``,
    });
  });

  return embed;
};
