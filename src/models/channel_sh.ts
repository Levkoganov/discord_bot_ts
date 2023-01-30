import { Schema, model } from "mongoose";
import { IChannel } from "../../types";

const reqString = {
  type: String,
  require: true,
};

const setChannel = new Schema<IChannel>({
  guildId: reqString,
  channelId: reqString,
  channelName: reqString,
});

export default model("Channel", setChannel);
