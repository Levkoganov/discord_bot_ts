import { Schema, model } from "mongoose";
import { ITimeLimit } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const setTimeLimit = new Schema<ITimeLimit>({
  _id: reqString,
  username: reqString,
  games: [
    {
      name: reqString,
      createdAt: reqString,
    },
  ],
});

export default model("TimeLimit", setTimeLimit);
