import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  champion: User,
  challenger: User,
  rounds: number,
  game: string,
  imgPathString: string | null,
  isRanked: boolean
): EmbedBuilder => {
  const championInfo = isRanked
    ? `**__Player1__ (0) \n \`1\` ${champion}**`
    : `**__Champion__ (0) \n \`1\` ${champion}**`;
  const challengerInfo = isRanked
    ? `**__Player2__ (0) \n \`2\` ${challenger}**`
    : `**__Challenger__ (0) \n \`2\` ${challenger}**`;
  const titleInfo = isRanked
    ? `\`\`\`Rank Match - first to ${rounds}\`\`\``
    : `\`\`\`Match - first to ${rounds}\`\`\``;

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(titleInfo)
    .setAuthor({ name: game })
    .addFields([
      {
        name: "\u200B",
        value: championInfo,
        inline: true,
      },

      {
        name: "\u200B",
        value: `***--VS--***`,
        inline: true,
      },

      {
        name: "\u200B",
        value: challengerInfo,
        inline: true,
      },
    ])
    .setImage(`attachment://${imgPathString}`)
    .setTimestamp();
};
