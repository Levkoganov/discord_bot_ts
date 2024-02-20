import { EmbedBuilder } from "discord.js";

export default (cooldown: string, imgPathString: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("Shadow realm")
    .setDescription(
      `**You can escape the \`shadow realm\` after \`1 hours\` since the moment your been banished.**\n\n\`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``
    )
    .setImage(`attachment://${imgPathString}`);
};
