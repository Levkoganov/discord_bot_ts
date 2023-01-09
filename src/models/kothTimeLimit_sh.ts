import { Schema, model } from "mongoose";
import { IKothTimeLimit } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const setKothTimeLimit = new Schema<IKothTimeLimit>({
  _id: reqString,
  username: reqString,
  games: [
    {
      name: reqString,
      createdAt: reqString,
    },
  ],
});

export default model("kothTimeLimit", setKothTimeLimit);
