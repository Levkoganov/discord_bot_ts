import { User } from "discord.js";
import timeLimit_sh from "../models/timeLimit_sh";
import moment from "moment";
import { ITimeLimit, IUserCooldownTimer } from "../../types";

export const checkChallengerCooldown = async (
  user: User,
  game: string
): Promise<IUserCooldownTimer> => {
  const userCooldownTimer: IUserCooldownTimer = {
    isBlocked: false,
    cooldown: "",
  };
  const { id } = user;

  const userTimeLimit = await timeLimit_sh.findById(id);
  if (userTimeLimit === null) return userCooldownTimer;

  const gameTimeLimit = userTimeLimit.games.find(({ name }) => name === game);
  if (gameTimeLimit === undefined) return userCooldownTimer;

  const currentLocalTime = moment().format();
  const { createdAt } = gameTimeLimit;

  const hours = timePassedInHours(currentLocalTime, createdAt);

  if (hours >= 12) {
    return userCooldownTimer;
  } else {
    userCooldownTimer["cooldown"] = timeLeft(currentLocalTime, createdAt);
    userCooldownTimer["isBlocked"] = true;
    return userCooldownTimer;
  }
};

export const updateLoserCooldown = async (user: User, game: string) => {
  const { id, username } = user;
  const currentLocalTime = moment().format();

  const loserPrevCooldown = await timeLimit_sh.findById(id);
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
    await new timeLimit_sh(setLoserTimeLimit).save();
  } else {
    const filter = { "games.name": game, _id: id };
    const update = { "games.$.createdAt": currentLocalTime };
    const options = { new: true };
    const gameCooldown = await timeLimit_sh.findOneAndUpdate(
      filter,
      { $set: update },
      options
    );

    if (!gameCooldown) {
      loserPrevCooldown.games.push({
        name: game,
        createdAt: currentLocalTime,
      });
      loserPrevCooldown.save();
    }
  }
};

function timePassedInHours(currentTime: string, createdAt: string): number {
  const currTime = moment(currentTime);
  const created = moment(createdAt);
  return currTime.diff(created, "hours");
}

const timeLeft = (currentTime: string, createdAt: string): string => {
  const currTime = moment(currentTime);
  const created = moment(createdAt);

  return moment
    .utc(moment(currTime, "HH:mm:ss").diff(moment(created, "HH:mm:ss")))
    .format("HH:mm:ss");
};
