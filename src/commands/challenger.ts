import {
  AttachmentBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { setTimeout as wait } from "node:timers/promises";
import champion_sh from "../models/champion_sh";
import { updateLoserCooldown } from "../services/kothTimeLimit";
import getGameImg from "../helpers/getGameImg";
import kothMatchEmbed from "../helpers/embed/matchEmbed";
import updateKothWinStreak from "../services/updateKothWinStreak";
import channel_sh from "../models/channel_sh";
import updateKothLeaderboardChannel from "../services/updateLeaderboardChannel";
import findAndUpdateChampion from "../services/findAndUpdateChampion";
import updateKothRole from "../services/updateKothRole";
import { gamesOption } from "../constants/gameOptionsFunc";
import { ACCEPTROW, matchClickableBtnsRow } from "../constants/btnRows";
import { filterInteraction } from "../services/filterUserInteractions";
import acceptionEmbed from "../helpers/embed/acceptionEmbed";
import {
  authorizeCurrentGameChampion,
  authorizeUserCommand,
} from "../services/authorizeUserCommand";

export = {
  data: new SlashCommandBuilder()
    .setName("challenger")
    .setDescription("Choose the challenger")

    .addStringOption((option) => gamesOption(option))

    .addNumberOption((option) =>
      option
        .setName("rounds")
        .setDescription("select number of rounds")
        .setRequired(true)
        .addChoices({
          name: "First to 3",
          value: 3,
        })
        .addChoices({
          name: "First to 5",
          value: 5,
        })
    )

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

    // Base Variables
    const kothRoleName = "KOTH - Champion";
    const { id } = interaction.guild;
    const champion = interaction.user;
    const game = interaction.options.getString("game", true);
    const challenger = interaction.options.getUser("challenger", true);
    const rounds = interaction.options.getNumber("rounds", true);

    // Func Variables
    const userCurrentTitles = await champion_sh.find({ userId: champion.id });
    const kothLeaderboardChannel = await channel_sh.findOne({ guildId: id });
    const isUserCurrentGameChampion = authorizeCurrentGameChampion(
      userCurrentTitles,
      game
    );
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === kothRoleName
    );

    const isUserAuthorize = await authorizeUserCommand(
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

    const acceptrRow = ACCEPTROW;
    const acceptEmbed = acceptionEmbed(challenger, true, game, imgPathString);

    const matchRow = matchClickableBtnsRow(champion, challenger);
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
      components: [acceptrRow],
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
          components: [matchRow],
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
            await i.update({ embeds: [matchEmbed] });
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
            await i.update({ embeds: [matchEmbed] });
          }
        }

        // Reset(btn)
        if (i.customId === "Reset") {
          championScore = 0;
          challengerScore = 0;
          matchEmbed.data.fields[0].value = `**__Champion__ (${championScore})\n  \`1\` ${champion}**`;
          matchEmbed.data.fields[2].value = `**__Challenger__ (${challengerScore})\n \`2\` ${challenger}**`;
          await i.update({ embeds: [matchEmbed] });
        }

        // Delete(btn)
        if (i.customId === "Delete") {
          await rep.delete();
        }
      });
    });
  },
};
