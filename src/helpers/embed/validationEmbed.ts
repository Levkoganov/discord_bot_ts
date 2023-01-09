import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (opponent: User): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("DarkGreen")
    .setTitle("Rank match")
    .setDescription(
      `\`\`\`"${opponent.username}" \nmust accept to procced with the match\`\`\``
    );
};
