import { TextChannel, AttachmentBuilder } from "discord.js";
import champion_sh from "../models/champion_sh";
import kothLeaderboardEmbed from "../helpers/embed/kothLeaderboardEmbed";

export default async (channel: TextChannel): Promise<void> => {
  const botId = process.env.BOT_ID;
  const allChannelMsgs = await channel.messages.fetch();
  const fgcBotChannelMsgs = allChannelMsgs.find(
    (msg) => msg.author.id === botId
  );

  const leaderboardLogo = new AttachmentBuilder("./public/img/FGC.png");
  const champions = await champion_sh.find();
  const embed = kothLeaderboardEmbed(champions);

  if (fgcBotChannelMsgs === undefined) {
    await channel.send({ embeds: [embed], files: [leaderboardLogo] });
  } else {
    await fgcBotChannelMsgs.edit({
      embeds: [embed],
      files: [leaderboardLogo],
    });
  }
};
