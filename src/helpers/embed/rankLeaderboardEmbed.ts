import { EmbedBuilder } from "discord.js";
import { IPlayerScore } from "../../../types";

export default (players: IPlayerScore[]) => {
  const firstPlace = "<:first_place:1001936928133873745>"; // Winner emoji
  const secondPlace = "<:second_place:1001936945208889465>"; // Winner emoji
  const thirdPlace = "<:third_place:1001936962862719026>"; // Winner emoji

  const embed = new EmbedBuilder()
    .setColor("#C27C0E")
    .setTitle("\u200B")
    .setAuthor({ name: "Rank leaderboard" })
    .setImage(`attachment://FGC.png`)
    .setFooter({
      text: "leaderboards last update",
      iconURL: "https://i.imgur.com/AfFp7pu.png",
    })
    .setTimestamp();

  players.forEach((data) => {
    embed.addFields({
      name: `${
        data.rank === 1
          ? firstPlace
          : data.rank === 2
          ? secondPlace
          : data.rank === 3
          ? thirdPlace
          : `\`Rank ${data.rank}\` :`
      } __${data.username}__`,
      value: `\`\`\`Points:${data.score} | Win:${data.win} | Lose:${data.lose}\`\`\``,
    });
  });

  return embed;
};
