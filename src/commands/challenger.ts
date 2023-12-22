import {
  AttachmentBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { setTimeout as wait } from "node:timers/promises";
import champion_sh from "../models/champion_sh";
import { updateLoserCooldown } from "../helpers/timer_func/kothTimeLimit";
import getGameImg from "../helpers/getGameImg";
import kothMatchEmbed from "../helpers/embed_func/matchEmbed";
import updateKothWinStreak from "../helpers/db_func/updateKothWinStreak";
import channel_sh from "../models/channel_sh";
import updateKothLeaderboardChannel from "../helpers/db_func/updateLeaderboardChannel";
import findAndUpdateChampion from "../helpers/db_func/findAndUpdateChampion";
import updateKothRole from "../helpers/db_func/updateKothRole";
import {
  gamesOption,
  numberOfRoundsOption,
} from "../constants/gameOptionsFunc";
import { ACCEPTBTNROW, matchClickableBtnsRow } from "../constants/btnRows";
import { filterInteraction } from "../helpers/validation_func/filterUserInteractions";
import acceptionEmbed from "../helpers/embed_func/acceptionEmbed";
import {
  validateCurrentGameChampion,
  validateUserCommand,
} from "../helpers/validation_func/validations";

export = {
  data: new SlashCommandBuilder()
    .setName("challenger")
    .setDescription("Choose the challenger")
    .addStringOption((option) => gamesOption(option))
    .addNumberOption((option) => numberOfRoundsOption(option))
    .addUserOption((option) =>
      option
        .setName("challenger")
        .setDescription("select your challenger")
        .setRequired(true)
    ),

  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    // Variables
    const kothRoleName = "KOTH - Champion";
    const { id } = interaction.guild;
    const champion = interaction.user;
    const game = interaction.options.getString("game", true);
    const challenger = interaction.options.getUser("challenger", true);
    const rounds = interaction.options.getNumber("rounds", true);
    const userCurrentTitles = await champion_sh.find({ userId: champion.id });
    const kothLeaderboardChannel = await channel_sh.findOne({ guildId: id });
    const isUserCurrentGameChampion = validateCurrentGameChampion(
      userCurrentTitles,
      game
    );
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === kothRoleName
    );

    const isUserAuthorize = await validateUserCommand(
      interaction,
      champion,
      challenger,
      role,
      game,
      isUserCurrentGameChampion,
      kothLeaderboardChannel
    );

    if (!isUserAuthorize) return;

    const imgPathString = getGameImg(game);
    const gameImg = new AttachmentBuilder(`./public/img/${imgPathString}`);

    const acceptBtnRow = ACCEPTBTNROW;
    const acceptEmbed = acceptionEmbed(challenger, true, game, imgPathString);

    const matchBtnRow = matchClickableBtnsRow(champion, challenger);
    const matchEmbed = kothMatchEmbed(
      champion,
      challenger,
      rounds,
      false,
      game,
      imgPathString
    );

    let championScore = 0;
    let challengerScore = 0;
    const Winneremoji = "<:trophy:988122907815325758>";

    // Koth Channel
    const channel = interaction.guild.channels.cache.get(
      kothLeaderboardChannel!.channelId
    ) as TextChannel;

    const rep = await interaction.reply({
      embeds: [acceptEmbed],
      components: [acceptBtnRow],
      files: [gameImg],
      fetchReply: true,
    });

    const acceptCollector = rep.createMessageComponentCollector({
      time: 1000 * 60 * 2, // 2min
    });

    acceptCollector.on("collect", async (i) => {
      const isBtnClickedByChallenger = await filterInteraction(i, challenger);
      if (!isBtnClickedByChallenger) return;

      // Accept(btn)
      if (i.customId === "Accept") {
        await rep.edit({
          components: [],
          embeds: [],
          files: [],
          content: "`loading...`",
        });

        await i.update({
          content: "",
          embeds: [matchEmbed],
          components: [matchBtnRow],
          files: [gameImg],
        });
        acceptCollector.stop();
        return;
      }

      // Decline(btn)
      if (i.customId === "Decline") {
        await rep.edit({
          components: [],
          embeds: [],
          files: [],
          content: `\`\`\`${challenger.username} declined the match...\`\`\``,
        });
        await wait(3000);
        await rep.delete();
        acceptCollector.stop();
        return;
      }
    });

    acceptCollector.on("end", async (_, reason) => {
      if (reason === "time") {
        await rep.edit({
          content: `\`\`\`${challenger.username} didn't accept the match in time...\`\`\``,
          components: [],
          embeds: [],
        });

        await wait(3000);
        await rep.delete();
        acceptCollector.stop();
        return;
      }

      const matchCollector = rep.createMessageComponentCollector({
        time: 1000 * 60 * 90, // 90min
      });

      matchCollector.on("collect", async (i) => {
        const isBtnClickedByChampion = await filterInteraction(i, champion);
        if (matchEmbed.data.fields === undefined) return;
        if (!isBtnClickedByChampion) return;

        // Champion(btn)
        if (i.customId === champion.username) {
          championScore++;
          matchEmbed.data.fields[0].value = `**__Champion__ (${championScore})\n  \`1\` ${champion}**`;

          if (championScore === rounds) {
            matchEmbed.data.fields[2].value = `*~~__Challenger__ (${challengerScore})\n \`2\` ${challenger}~~*`;
            matchEmbed.setTitle(
              `${Winneremoji}\`\`\`${champion.username} (${championScore} - ${challengerScore})\`\`\``
            );
            await i.update({
              embeds: [matchEmbed],
              files: [gameImg],
              components: [],
            });

            const winner = await champion_sh.findOne({
              userId: champion.id,
              game: game,
            });

            await updateKothWinStreak(winner);
            await updateLoserCooldown(challenger, game);
            await updateKothLeaderboardChannel(channel);

            matchCollector.stop();
          } else {
            await i.update({ embeds: [matchEmbed], files: [gameImg] });
          }
        }

        // Challenger(btn)
        if (i.customId === challenger.username) {
          challengerScore++;
          matchEmbed.data.fields[2].value = `**__Challenger__ (${challengerScore})\n \`2\` ${challenger}**`;

          if (challengerScore === rounds) {
            matchEmbed.data.fields[0].value = `*~~__Champion__ (${championScore})\n  \`1\`  ${champion}~~*`;
            matchEmbed.setTitle(
              `${Winneremoji}\`\`\`${challenger.username} (${championScore} - ${challengerScore})\`\`\``
            );

            await i.update({
              embeds: [matchEmbed],
              files: [gameImg],
              components: [],
            });

            const challengerMember =
              interaction.options.getMember("challenger");
            const prevChampion = await findAndUpdateChampion(game, challenger);

            await updateKothRole(
              interaction,
              prevChampion?.userId,
              role!,
              challengerMember
            );
            await updateLoserCooldown(champion, game);
            await updateKothLeaderboardChannel(channel);
          } else {
            await i.update({ embeds: [matchEmbed], files: [gameImg] });
          }
        }

        // Reset(btn)
        if (i.customId === "Reset") {
          championScore = 0;
          challengerScore = 0;
          matchEmbed.data.fields[0].value = `**__Champion__ (${championScore})\n  \`1\` ${champion}**`;
          matchEmbed.data.fields[2].value = `**__Challenger__ (${challengerScore})\n \`2\` ${challenger}**`;
          await i.update({ embeds: [matchEmbed], files: [gameImg] });
        }

        // Delete(btn)
        if (i.customId === "Delete") {
          await rep.delete();
        }
      });
    });
  },
};
