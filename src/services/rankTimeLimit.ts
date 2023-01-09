import { User } from "discord.js";
import rankTimeLimit_sh from "../models/rankTimeLimit_sh";
import moment from "moment";
import { IUserCooldownTimer } from "../../types";
import { cooldownTimer } from "../helpers/timeLimitCalculate";

export const checkRankPlayersTimeLimit = async (
  player1: User,
  player2: User
): Promise<IUserCooldownTimer> => {
  const { id: p1Id } = player1;
  const { id: p2Id } = player2;
  const currentLocalTime = moment().format();
  const playersCooldownTimer: IUserCooldownTimer = {
    isBlocked: false,
    cooldown: "",
  };

  const rankMatch = await rankTimeLimit_sh.findOne({
    "player1.id": p1Id,
    "player2.id": p2Id,
  });

  if (rankMatch) {
    const { createdAt } = rankMatch;
    return cooldownTimer(createdAt, playersCooldownTimer, currentLocalTime, 6);
  }

  const reverseRankMatch = await rankTimeLimit_sh.findOne({
    "player1.id": p2Id,
    "player2.id": p1Id,
  });

  if (reverseRankMatch) {
    const { createdAt } = reverseRankMatch;
    return cooldownTimer(createdAt, playersCooldownTimer, currentLocalTime, 6);
  }

  return playersCooldownTimer;
};

export const updateRankPlayersTimeLimit = async (
  player1: User,
  player2: User
): Promise<void> => {
  const { id: p1Id, username: p1Username } = player1;
  const { id: p2Id, username: p2UserName } = player2;
  const currentLocalTime = moment().format();
  const update = { createdAt: currentLocalTime };
  const option = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  const rankMatch = await rankTimeLimit_sh.findOne({
    "player1.id": p1Id,
    "player2.id": p2Id,
  });

  if (rankMatch) {
    const filter = { _id: rankMatch.id };
    await rankTimeLimit_sh.findOneAndUpdate(filter, update, option);
    return;
  }

  const reverseRankMatch = await rankTimeLimit_sh.findOne({
    "player1.id": p2Id,
    "player2.id": p1Id,
  });

  if (reverseRankMatch) {
    const filter = { _id: reverseRankMatch.id };
    await rankTimeLimit_sh.findOneAndUpdate(filter, update, option);
    return;
  }

  const rankMatchCooldown = {
    player1: {
      username: p1Username,
      id: p1Id,
    },
    player2: {
      username: p2UserName,
      id: p2Id,
    },
    createdAt: currentLocalTime,
  };
  await new rankTimeLimit_sh(rankMatchCooldown).save();
};
