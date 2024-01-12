import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  opponent: User,
  isChallenger?: boolean,
  game?: string | undefined,
  imgPathString?: string | null | undefined
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle(game ? game : "Shadow game")
    .setDescription(
      !isChallenger
        ? `\`\`\`"${opponent.username}" \nmust accept to proceed with the match.\n\n*WARNING*\nThe loser gonna be banished to the shadow realm...\`\`\``
        : `\`\`\`"${opponent.username}" \nmust accept to proceed with the match. \`\`\``
    )
    .setImage(imgPathString ? `attachment://${imgPathString}` : null);
};
