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
      value: `\`\`\`${data.username} \nWinstreak: ${data.winstreak} \`\`\``,
    });
  });

  return embed;
};
