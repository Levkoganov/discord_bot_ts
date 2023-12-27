import { Schema, model } from "mongoose";
import { ISetChampion } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const defaultNumber = {
  type: Number,
  default: 0,
};
const setChampion = new Schema<ISetChampion>(
  {
    userId: reqString,
    game: reqString,
    username: reqString,
    winstreak: defaultNumber,
    highestWinstreak: {
      type: Schema.Types.ObjectId,
      ref: "GameHighestWinstreak",
    },
  },
  { timestamps: true }
);

export default model<ISetChampion>("Champion", setChampion);
