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

export interface IChannel {
  guildId: string;
  channelId: string;
  type: string;
  channelName: string;
}

export interface IUserCooldownTimer {
  cooldown: string;
  isBlocked: boolean;
}

export interface IRankTimeLimit {
  player1: string;
  player2: string;
  createdAt: string;
}

interface IPlayerData {
  username: string;
  id: string;
}

export interface IKothTimeLimit {
  _id: string;
  username: string;
  games: IGame[];
}
interface IGame {
  name: string;
  createdAt: string;
}

export interface IPlayerScore {
  _id: string;
  username: string;
  win: number;
  lose: number;
  score: number;
  rank?: number;
}
