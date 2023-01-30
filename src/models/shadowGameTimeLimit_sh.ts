import { Schema, model } from "mongoose";

import { IShadowGameTimeLimit } from "../../types";
const reqString = {
  type: String,
  require: true,
};

const setShadowGameTimeLimit = new Schema<IShadowGameTimeLimit>({
  player1: {
    username: reqString,
    id: reqString,
  },
  player2: {
    username: reqString,
    id: reqString,
  },
  loserId: reqString,
  createdAt: reqString,
});

export default model("shadowGameTimeLimit", setShadowGameTimeLimit);
