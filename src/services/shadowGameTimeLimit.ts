import { User } from "discord.js";
import shadowGameTimeLimit_sh from "../models/shadowGameTimeLimit_sh";
import moment from "moment";
import { IUserCooldownTimer } from "../../types";
import { cooldownTimer } from "../helpers/timeLimitCalculate";

export const checkShadowGameTimeLimit = async (
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

  const prevShadowGame = await shadowGameTimeLimit_sh.findOne({
    "player1.id": p1Id,
    "player2.id": p2Id,
  });

  if (prevShadowGame) {
    const { createdAt } = prevShadowGame;
    return cooldownTimer(createdAt, playersCooldownTimer, currentLocalTime, 3);
  }

  const reversePrevShadowGame = await shadowGameTimeLimit_sh.findOne({
    "player1.id": p2Id,
    "player2.id": p1Id,
  });

  if (reversePrevShadowGame) {
    const { createdAt } = reversePrevShadowGame;
    return cooldownTimer(createdAt, playersCooldownTimer, currentLocalTime, 3);
  }

  return playersCooldownTimer;
};

export const updateShadowGameTimeLimit = async (
  player1: User,
  player2: User,
  loserId: string
): Promise<void> => {
  const { id: p1Id, username: p1Username } = player1;
  const { id: p2Id, username: p2UserName } = player2;
  const currentLocalTime = moment().format();
  const update = { createdAt: currentLocalTime, loserId };
  const option = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  const prevShadowGame = await shadowGameTimeLimit_sh.findOne({
    "player1.id": p1Id,
    "player2.id": p2Id,
  });

  if (prevShadowGame) {
    const filter = { _id: prevShadowGame.id };
    await shadowGameTimeLimit_sh.findOneAndUpdate(filter, update, option);
    return;
  }

  const reversePrevShadowGame = await shadowGameTimeLimit_sh.findOne({
    "player1.id": p2Id,
    "player2.id": p1Id,
  });

  if (reversePrevShadowGame) {
    const filter = { _id: reversePrevShadowGame.id };
    await shadowGameTimeLimit_sh.findOneAndUpdate(filter, update, option);
    return;
  }

  const prevShadowGameCooldown = {
    player1: {
      username: p1Username,
      id: p1Id,
    },
    player2: {
      username: p2UserName,
      id: p2Id,
    },
    loserId,
    createdAt: currentLocalTime,
  };
  await new shadowGameTimeLimit_sh(prevShadowGameCooldown).save();
};
