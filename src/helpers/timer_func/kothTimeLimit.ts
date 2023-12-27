import { User } from "discord.js";
import kothTimeLimit_sh from "../../models/kothTimeLimit_sh";
import moment from "moment";
import { IUserCooldownTimer } from "../../../types";
import { cooldownTimer } from "./timeLimitCalculate";

export const checkChallengerCooldown = async (user: User, game: string): Promise<IUserCooldownTimer> => {
  const userCooldownTimer: IUserCooldownTimer = {
    isBlocked: false,
    cooldown: "",
  };
  const { id } = user;
  const userTimeLimit = await kothTimeLimit_sh.findById(id);
  if (userTimeLimit === null) return userCooldownTimer;

  const gameTimeLimit = userTimeLimit.games.find(({ name }) => name === game);
  if (gameTimeLimit === undefined) return userCooldownTimer;

  const currentLocalTime = moment().format();
  const { createdAt } = gameTimeLimit;
  return cooldownTimer(createdAt, userCooldownTimer, currentLocalTime, 12);
};

export const updateLoserCooldown = async (user: User, game: string) => {
  const { id, username } = user;
  const currentLocalTime = moment().format();

  const loserPrevCooldown = await kothTimeLimit_sh.findById(id);
  if (!loserPrevCooldown) {
    const setLoserTimeLimit = {
      _id: id,
      username: username,
      createdAt: currentLocalTime,
      games: [
        {
          name: game,
          createdAt: currentLocalTime,
        },
      ],
    };
    await new kothTimeLimit_sh(setLoserTimeLimit).save();
  } else {
    const filter = { "games.name": game, _id: id };
    const update = { "games.$.createdAt": currentLocalTime };
    const options = { new: true };
    const gameCooldown = await kothTimeLimit_sh.findOneAndUpdate(filter, { $set: update }, options);

    if (!gameCooldown) {
      loserPrevCooldown.games.push({
        name: game,
        createdAt: currentLocalTime,
      });
      loserPrevCooldown.save();
    }
  }
};
