import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  player: User,
  game?: string | undefined,
  imgPathString?: string | null | undefined
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle(game ? game : "Shadow game")
    .setDescription(
      `\`\`\`"${player.username}" \nmust accept to procced with the match. \`\`\``
    )
    .setImage(imgPathString ? `attachment://${imgPathString}` : null);
};
