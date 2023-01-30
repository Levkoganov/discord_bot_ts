import { User } from "discord.js";

import { EmbedBuilder } from "discord.js";

export default (opponent: User): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("Shadow game")
    .setDescription(
      `\`\`\`"${opponent.username}" \nmust accept to procced with the match.\n\n*WARNING*\nThe loser gonna be banished to the shadow realm...\`\`\``
    );
};
