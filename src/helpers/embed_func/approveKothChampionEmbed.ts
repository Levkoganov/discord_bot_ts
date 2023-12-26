import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (
  player: User,
  game: string,
  imgPathString?: string | null | undefined
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle(game)
    .setDescription(
      `\`\`\`"${player.username}" \nPlease click on "accept" to become the new ${game} champion. \`\`\``
    )
    .setImage(imgPathString ? `attachment://${imgPathString}` : null);
};
