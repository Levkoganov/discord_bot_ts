import { TextChannel, AttachmentBuilder } from "discord.js";
import champion_sh from "../models/champion_sh";
import kothLeaderboard_embed from "../helpers/embed/kothLeaderboard_embed";

export default async (channel: TextChannel): Promise<void> => {
  const botId = "1003408217281413170";
  const allChannelMsgs = await channel.messages.fetch();
  const fgcBotChannelMsgs = allChannelMsgs.find(
    (msg) => msg.author.id === botId
  );

  const kothleaderboardLogo = new AttachmentBuilder("./public/img/FGC.png");
  const champions = await champion_sh.find();
  const embed = kothLeaderboard_embed(champions);

  if (fgcBotChannelMsgs === undefined) {
    await channel.send({ embeds: [embed], files: [kothleaderboardLogo] });
  } else {
    await fgcBotChannelMsgs.edit({
      embeds: [embed],
      files: [kothleaderboardLogo],
    });
  }
};
