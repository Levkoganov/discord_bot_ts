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
import { findKothChampion } from "../helpers/db_func/findKothChampion";
import approveKothChampionEmbed from "../helpers/embed_func/approveKothChampionEmbed";

export = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Choose the champion")
    .addStringOption((option) => gamesOption(option))
    .addNumberOption((option) => numberOfRoundsOption(option)),
  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    // Interaction variables
    const { id } = interaction.guild;
    const challenger = interaction.user;
    const kothRoleName = "KOTH - Champion";
    const rounds = interaction.options.getNumber("rounds", true);
    const game = interaction.options.getString("game", true);

    // Gameimg Variables
    const imgPathString = getGameImg(game);
    const gameImg = new AttachmentBuilder(`./public/img/${imgPathString}`);

    // FN Variables
    const champion = await findKothChampion(game, interaction);
    const kothLeaderboardChannel = await channel_sh.findOne({ guildId: id });
    const channel = interaction.guild.channels.cache.get(
      kothLeaderboardChannel!.channelId
    ) as TextChannel;
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === kothRoleName
    );

    if (champion === undefined) {
      const approveKothCmapionEmbed = approveKothChampionEmbed(
        challenger,
        game,
        imgPathString
      );

      const repApprove = await interaction.reply({
        embeds: [approveKothCmapionEmbed],
        components: [ACCEPTBTNROW],
        files: [gameImg],
        fetchReply: true,
      });

      const approveCollector = repApprove.createMessageComponentCollector({
        time: 1000 * 60 * 2, // 2min
      });

      approveCollector.on("collect", async (i) => {
        const isBtnClickedByChallenger = await filterInteraction(i, challenger);
        if (!isBtnClickedByChallenger) return;

        // Accept(btn)
        if (i.customId === "Accept") {
          const newChampion = interaction.guild.members.cache.get(
            challenger.id
          );

          await updateKothRole(interaction, role!, newChampion);
          await findAndUpdateChampion(game, challenger);
          await updateKothLeaderboardChannel(channel);

          approveKothCmapionEmbed.setDescription(
            `\`\`\`"${challenger.username}" \nis now the new ${game} champion! \`\`\``
          );

          await i.update({
            components: [],
            embeds: [approveKothCmapionEmbed],
            files: [gameImg],
          });
          approveCollector.stop();
          return;
        }

        // Decline(btn)
        if (i.customId === "Decline") {
          await repApprove.edit({
            components: [],
            embeds: [],
            files: [],
            content: `\`\`\`${challenger.username} declined...\`\`\``,
          });
          await wait(3000);
          await repApprove.delete();
          approveCollector.stop();
          return;
        }
      });
      return;
    }

    const userCurrentTitles = await champion_sh.find({ userId: champion.id });

    const isUserCurrentGameChampion = validateCurrentGameChampion(
      userCurrentTitles,
      game
    );

    // Validate if user may use the challenge command
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

    const acceptEmbed = acceptionEmbed(champion, true, game, imgPathString);
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

    const rep = await interaction.reply({
      embeds: [acceptEmbed],
      components: [ACCEPTBTNROW],
      files: [gameImg],
      fetchReply: true,
    });

    const acceptCollector = rep.createMessageComponentCollector({
      time: 1000 * 60 * 2, // 2min
    });

    acceptCollector.on("collect", async (i) => {
      const isBtnClickedByChallenger = await filterInteraction(i, champion);
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
          content: `\`\`\`${champion.username} declined the match...\`\`\``,
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
          components: [],
          embeds: [],
          files: [],
          content: `\`\`\`${champion.username} didn't accept the match in time...\`\`\``,
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

            const newChampion = interaction.guild.members.cache.get(
              challenger.id
            );
            const prevChampion = await findAndUpdateChampion(game, challenger);

            await updateKothRole(
              interaction,
              role!,
              newChampion,
              prevChampion?.userId
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
