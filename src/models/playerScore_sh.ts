import { Schema, model } from "mongoose";
import { IPlayerScore } from "../../types";

const reqString = {
  type: String,
  require: true,
};
const defaultNumber = {
  type: Number,
  default: 0,
};

const defaultScore = {
  type: Number,
  default: 100,
};

const setPlayerScore = new Schema<IPlayerScore>({
  _id: reqString,
  username: reqString,
  win: defaultNumber,
  lose: defaultNumber,
  score: defaultScore,
});

export default model("playerScore", setPlayerScore);
