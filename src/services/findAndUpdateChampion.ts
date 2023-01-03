import { User } from "discord.js";
import { ISetChampion } from "../../types";
import champion_sh from "../models/champion_sh";

export default async (
  game: string,
  newChampion: User
): Promise<ISetChampion | null> => {
  const { username, id } = newChampion;
  const filter = { game: game };
  const update = {
    userId: id,
    game: game,
    username: username,
    winstreak: 0,
  };
  const option = { upsert: true };

  const prevChampion = await champion_sh.findOneAndUpdate(
    filter,
    update,
    option
  );

  return prevChampion;
};
