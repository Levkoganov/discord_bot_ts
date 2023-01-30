import { GuildMember, Role } from "discord.js";

export default async (
  loser: GuildMember | undefined,
  role: Role
): Promise<void> => {
  await loser?.roles.add(role);
};
