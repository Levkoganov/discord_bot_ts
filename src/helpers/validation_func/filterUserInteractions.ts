import { MessageComponentInteraction, User } from "discord.js";

export const filterInteraction = async (i: MessageComponentInteraction, user: User) => {
  if (i.user.id === user.id) return true;
  else {
    await i.reply({
      content: `These buttons aren't for you...`,
      ephemeral: true,
    });
    return false;
  }
};
