import { Schema, model } from "mongoose";

import { IRankTimeLimit } from "../../types";
const reqString = {
  type: String,
  require: true,
};

const setRankTimeLimit = new Schema<IRankTimeLimit>({
  player1: {
    username: reqString,
    id: reqString,
  },
  player2: {
    username: reqString,
    id: reqString,
  },
  createdAt: reqString,
});

export default model("rankTimeLimit", setRankTimeLimit);
