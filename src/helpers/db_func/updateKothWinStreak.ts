import { ISetChampion } from "../../../types";
import champion_sh from "../../models/champion_sh";

export default async (winner: ISetChampion | null) => {
  if (winner) {
    const winnersData = await champion_sh.findOneAndUpdate(
      { _id: winner._id },
      { $inc: { winstreak: 1 } },
      { new: true, upsert: true, useFindAndModify: false }
    );

    return winnersData as ISetChampion;
  }
};
