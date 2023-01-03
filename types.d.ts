import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ExtendedClient } from "./src/./classes/extentedClient";
import { ObjectId } from "mongoose";

export type TSlashCommandData = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
};

export interface ISetChampion {
  _id: ObjectId;
  userId: string;
  game: string;
  username: string;
  winstreak: number;
}

export interface IKothChannel {
  _id: string;
  channelId: string;
  channelName: string;
}

export interface IUserCooldownTimer {
  cooldown: string;
  isBlocked: boolean;
}

export interface ITimeLimit {
  _id: string;
  username: string;
  games: IGame[];
}
interface IGame {
  name: string;
  createdAt: string;
}
