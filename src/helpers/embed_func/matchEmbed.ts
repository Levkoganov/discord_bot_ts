import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  champion: User,
  challenger: User,
  rounds: number,
  isShadowGame: boolean,
  game?: string | undefined,
  imgPathString?: string | null | undefined
): EmbedBuilder => {
  const championInfo = isShadowGame
    ? `**__Player1__ (0) \n \`1\` ${champion}**`
    : `**__Champion__ (0) \n \`1\` ${champion}**`;
  const challengerInfo = isShadowGame
    ? `**__Player2__ (0) \n \`2\` ${challenger}**`
    : `**__Challenger__ (0) \n \`2\` ${challenger}**`;
  const titleInfo = isShadowGame
    ? `\`\`\`first to ${rounds}\`\`\``
    : `\`\`\`Match - first to ${rounds}\`\`\``;

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(titleInfo)
    .setAuthor({ name: game ? game : "Shadow game" })
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
    .setImage(imgPathString ? `attachment://${imgPathString}` : null)
    .setTimestamp();
};
