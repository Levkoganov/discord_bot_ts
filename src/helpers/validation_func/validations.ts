import { CommandInteraction, GuildMemberRoleManager, User, Role } from "discord.js";
import { checkChallengerCooldown } from "../timer_func/kothTimeLimit";
import { IUserCooldownTimer } from "../../../types";

import { checkShadowGameTimeLimit } from "../timer_func/shadowGameTimeLimit";
import { roleNames } from "../../constants/constants";
let payload: IUserCooldownTimer = {
  cooldown: "",
  isBlocked: false,
};

export const validateUserCommand = async (
  interaction: CommandInteraction & GuildMemberRoleManager,
  user: User,
  opponent: User,
  role: Role | undefined,
  kothLeaderboardChannel?: any,
  game?: string | undefined
): Promise<boolean> => {
  if (game === undefined) {
    payload = await checkShadowGameTimeLimit(user, opponent);
  } else {
    payload = await checkChallengerCooldown(opponent, game);
  }

  const { cooldown, isBlocked } = payload;

  if (user.id === opponent.id) {
    await interaction.reply({
      content: "You cannot select yourself as a opponent...",
      ephemeral: true,
    });

    return false;
  }
  if (role === undefined) {
    await interaction.reply({
      content: `**__role__** does not exist.\nplease make sure to create all the necessary roles before using this command\n(${roleNames
        .map((role) => `**__${role}__**`)
        .join(", ")})`,
      ephemeral: true,
    });

    return false;
  }
  if (kothLeaderboardChannel === null) {
    await interaction.reply({
      content: `Please use \`/set-channel\` before using this command`,
      ephemeral: true,
    });

    return false;
  }
  if (isBlocked) {
    await interaction.reply({
      content: game
        ? `**\`You\` may challenge the \`Champion\` once every \`12 hours\`**.\n\n\`CURRENT CHAMPION:(${user.username})\`\n\`GAME:(${game})\` \`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``
        : `**You can do a \`shadowgame\` once every \`3 hours\` with the same opponent **.\n\`OPPONENT: (${opponent.username})\`\n\n\`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``,
      ephemeral: true,
    });
    return false;
  }
  return true;
};
