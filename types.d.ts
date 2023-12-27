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
  highestWinstreak: IGameHighestWinstreak;
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

export interface IShadowGameTimeLimit {
  player1: string;
  player2: string;
  loserId: string;
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

export interface IGameHighestWinstreak {
  _id: ObjectId;
  userId: string;
  game: string;
  username: string;
  winstreak: number;
}
