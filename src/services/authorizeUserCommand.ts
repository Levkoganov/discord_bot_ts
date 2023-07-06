import {
  CommandInteraction,
  GuildMemberRoleManager,
  User,
  Role,
} from "discord.js";
import { checkChallengerCooldown } from "./kothTimeLimit";
import { ISetChampion } from "../../types";

export const authorizeUserCommand = async (
  interaction: CommandInteraction & GuildMemberRoleManager,
  user: User,
  opponent: User,
  role: Role | undefined,
  game: string,
  isCurrentGameChampion?: boolean | undefined,
  kothLeaderboardChannel?: any
): Promise<boolean> => {
  const { cooldown, isBlocked } = await checkChallengerCooldown(opponent, game);

  if (!isCurrentGameChampion) {
    await interaction.reply({
      content: `Only the \`${game}\` champion can use this command`,
      ephemeral: true,
    });

    return false;
  }
  if (user.id === opponent.id) {
    await interaction.reply({
      content: "You cannot select yourself as a opponent...",
      ephemeral: true,
    });

    return false;
  }
  if (role === undefined) {
    await interaction.reply({
      content: `\`"KOTH - Champion"\` **__role__** doesn't exist.\nplease create this role before using this command`,
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
      content: `**The \`Opponent\` can challenge the \`Champion\` once every \`12 hours\`**.\n\n\`CHALLENGER: (${opponent.username})\`\n\`GAME: (${game})\` \`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``,
      ephemeral: true,
    });
    return false;
  }
  return true;
};

export const authorizeCurrentGameChampion = (
  champions: ISetChampion[],
  game: string
): boolean => {
  for (const champion of champions) {
    if (champion.game === game) return true;
  }

  return false;
};
