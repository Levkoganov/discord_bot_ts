import { TextChannel, AttachmentBuilder } from "discord.js";
import { IPlayerScore } from "../../types";
import champion_sh from "../models/champion_sh";
import kothLeaderboardEmbed from "../helpers/embed/kothLeaderboardEmbed";
import playerScore_sh from "../models/playerScore_sh";
import rankLeaderboardEmbed from "../helpers/embed/rankLeaderboardEmbed";

export default async (channel: TextChannel, isRanked?: true): Promise<void> => {
  const botId = process.env.BOT_ID;
  const allChannelMsgs = await channel.messages.fetch();
  const fgcBotChannelMsgs = allChannelMsgs.find(
    (msg) => msg.author.id === botId
  );

  const leaderboardLogo = new AttachmentBuilder("./public/img/FGC.png");
  let data;
  let embed;

  if (isRanked) {
    data = await getPlayersRank();
    embed = rankLeaderboardEmbed(data);
  } else {
    data = await champion_sh.find();
    embed = kothLeaderboardEmbed(data);
  }

  if (fgcBotChannelMsgs === undefined) {
    await channel.send({ embeds: [embed], files: [leaderboardLogo] });
  } else {
    await fgcBotChannelMsgs.edit({
      embeds: [embed],
      files: [leaderboardLogo],
    });
  }
};

async function getPlayersRank(): Promise<IPlayerScore[]> {
  return await playerScore_sh.aggregate<IPlayerScore>([
    {
      $sort: { score: -1, win: -1, lose: 1 },
    },
    {
      $group: { _id: "", items: { $push: "$$ROOT" } },
    },
    {
      $unwind: { path: "$items", includeArrayIndex: "items.rank" },
    },
    { $replaceRoot: { newRoot: "$items" } },
    {
      $addFields: { rank: { $add: ["$rank", 1] } },
    },
    {
      $project: {
        _id: "$_id",
        username: "$username",
        score: "$score",
        rank: "$rank",
        win: "$win",
        lose: "$lose",
      },
    },
    { $limit: 4 },
  ]);
}
