import { GuildMember, Role } from "discord.js";

export default async (winner: GuildMember | undefined, role: Role): Promise<void> => {
  await winner?.roles.add(role);
};
