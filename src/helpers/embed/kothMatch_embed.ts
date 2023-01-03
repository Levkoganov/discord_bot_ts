import { AttachmentBuilder, User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  champion: User,
  challenger: User,
  rounds: number,
  game: string,
  imgPathString: string | null
): EmbedBuilder => {
  const championInfo = `**__Champion__ (0) \n \`1\` ${champion}**`;
  const challengerInfo = `**__Challenger__ (0) \n \`2\` ${challenger}**`;

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`\`\`\`Match - first to  ${rounds}\`\`\``)
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
