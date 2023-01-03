import { Schema, model } from "mongoose";
import { IKothChannel } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const setKothChannel = new Schema<IKothChannel>({
  _id: reqString,
  channelId: reqString,
  channelName: reqString,
});

export default model("KOTH-Channel", setKothChannel);
