import { Schema, model } from "mongoose";
import { IGameHighestWinstreak } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const defaultNumber = {
  type: Number,
  default: 0,
};

const setGameHighestWinstreak = new Schema<IGameHighestWinstreak>({
  userId: reqString,
  game: reqString,
  username: reqString,
  winstreak: defaultNumber,
});

export default model<IGameHighestWinstreak>(
  "GameHighestWinstreak",
  setGameHighestWinstreak
);
