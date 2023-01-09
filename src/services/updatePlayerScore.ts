import { User } from "discord.js";
import playerScore_sh from "../models/playerScore_sh";
import pointSystem from "../helpers/pointSystem";

export default async (winner: User, loser: User): Promise<void> => {
  const { id: wId, username: wUsername } = winner;
  const { id: lId, username: lUsername } = loser;

  const winnerData = await playerScore_sh.findById(wId);
  const loserData = await playerScore_sh.findById(lId);

  // Player points
  const winnerPoints = await pointSystem(winner, loser);
  const loserPoints = await pointSystem(winner, loser, true);

  if (!winnerData) {
    await new playerScore_sh({
      _id: wId,
      username: wUsername,
      win: 1,
      score: winnerPoints,
    }).save();
  } else {
    await playerScore_sh.findOneAndUpdate(
      { _id: winnerData._id },
      { $inc: { score: winnerPoints, win: 1 } },
      { new: true, upsert: true, useFindAndModify: false }
    );
  }

  if (!loserData) {
    await new playerScore_sh({
      _id: lId,
      username: lUsername,
      lose: 1,
      score: loserPoints,
    }).save();
  } else {
    await playerScore_sh.findOneAndUpdate(
      { _id: loserData._id },
      { $inc: { score: loserPoints, lose: 1 } },
      { new: true, upsert: true, useFindAndModify: false }
    );
  }
};
