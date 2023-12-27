import { User } from "discord.js";
import { ISetChampion } from "../../../types";
import gameHighestWinstreak_sh from "../../models/gameHighestWinstreak_sh";
import champion_sh from "../../models/champion_sh";

export const findAndUpdateGameHigestWinstreak = async (game: string, player: User, winnerWinstreak?: ISetChampion) => {
  const { username, id } = player;
  const filter = { game: game };
  const update = { userId: id, game: game, username: username, winstreak: 0 };
  const option = { new: true, upsert: true, useFindAndModify: false };
  const currentGameHighestWinStreak = await gameHighestWinstreak_sh.findOne({ game });

  if (currentGameHighestWinStreak === null) {
    const gameNewHighestWinstreak = await gameHighestWinstreak_sh.findOneAndUpdate(filter, update, option);
    await champion_sh.findOneAndUpdate(filter, { highestWinstreak: gameNewHighestWinstreak?._id }, option);
    return;
  } else {
    if (winnerWinstreak === undefined) {
      await champion_sh.findOneAndUpdate(filter, { highestWinstreak: currentGameHighestWinStreak?._id }, option);
      return;
    }

    if (winnerWinstreak.winstreak > currentGameHighestWinStreak.winstreak) {
      const gameNewHighestWinstreak = await gameHighestWinstreak_sh.findOneAndUpdate(
        filter,
        { ...update, winstreak: winnerWinstreak.winstreak },
        option
      );

      await champion_sh.findOneAndUpdate(filter, { highestWinstreak: gameNewHighestWinstreak?._id }, option);
      return;
    }

    await champion_sh.findOneAndUpdate(filter, { highestWinstreak: currentGameHighestWinStreak?._id }, option);
    return;
  }
};
