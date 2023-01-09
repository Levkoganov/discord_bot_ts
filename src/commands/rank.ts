import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  GuildMemberRoleManager,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import getGameImg from "../helpers/getGameImg";
import validationEmbed from "../helpers/embed/validationEmbed";
import { setTimeout as wait } from "node:timers/promises";
import rankMatchEmbed from "../helpers/embed/matchEmbed";
import channel_sh from "../models/channel_sh";
import {
  checkRankPlayersTimeLimit,
  updateRankPlayersTimeLimit,
} from "../services/rankTimeLimit";
import updatePlayerScore from "../services/updatePlayerScore";
import updateRankLeaderboardChannel from "../services/updateLeaderboardChannel";
import updateLeaderboardChannel from "../services/updateLeaderboardChannel";

export = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Ranked match")

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
        .setName("opponent")
        .setDescription("Choose your opponent")
        .setRequired(true)
    ),

  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const opponent = interaction.options.getUser("opponent", true);
    const rounds = interaction.options.getNumber("rounds", true);
    const { id } = interaction.guild;
    const user = interaction.user;
    const game = "Dragonball_FighterZ";

    const imgPathString = getGameImg(game);
    const gameImg = new AttachmentBuilder(`./public/img/${imgPathString}`);

    const rankLeaderboardChannel = await channel_sh.findOne({
      guildId: id,
      type: "Rank",
    });

    if (rankLeaderboardChannel === null) {
      await interaction.reply({
        content: `Please use \`/set-koth-channel\` before using this command`,
        ephemeral: true,
      });
      return;
    }

    if (user.id === opponent.id) {
      await interaction.reply({
        content: "You cannot select yourself as a opponent...",
        ephemeral: true,
      });
      return;
    }

    const { cooldown, isBlocked } = await checkRankPlayersTimeLimit(
      user,
      opponent
    );

    if (isBlocked) {
      await interaction.reply({
        content: `**You can do \`ranked match\` with the same opponent once every \`6 hours\`**.\n\n\`OPPONENT: (${opponent.username})\`\n\`GAME: (${game})\` \`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``,
        ephemeral: true,
      });
      return;
    }

    const vEmbed = validationEmbed(opponent);
    const vRow = new ActionRowBuilder<ButtonBuilder>()
      // Btn(1)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Accept")
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success)
      )

      // Btn(2)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Decline")
          .setLabel("Decline")
          .setStyle(ButtonStyle.Danger)
      );

    const mEmbed = rankMatchEmbed(
      user,
      opponent,
      rounds,
      game,
      imgPathString,
      true
    );
    const mRow = new ActionRowBuilder<ButtonBuilder>()
      // Btn(1)
      .addComponents(
        new ButtonBuilder()
          .setCustomId(user.username)
          .setLabel(user.username)
          .setStyle(ButtonStyle.Primary)
      )

      // Btn(2)
      .addComponents(
        new ButtonBuilder()
          .setCustomId(opponent.username)
          .setLabel(opponent.username)
          .setStyle(ButtonStyle.Success)
      )

      // Btn(3)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Reset")
          .setLabel("RESET 🔄")
          .setStyle(ButtonStyle.Secondary)
      )

      // Btn(4)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Delete")
          .setLabel("DELETE ❌")
          .setStyle(ButtonStyle.Secondary)
      );

    const rep = await interaction.reply({
      embeds: [vEmbed],
      components: [vRow],
      fetchReply: true,
    });

    const vCollector = rep.createMessageComponentCollector({
      time: 1000 * 60 * 2, // 2min
    });

    vCollector.on("collect", async (i) => {
      if (i.user.id !== opponent.id) {
        await i.reply({
          content: `These buttons aren't for you...`,
          ephemeral: true,
        });
        return;
      }

      // Accept(btn)
      if (i.customId === "Accept") {
        await rep.edit({ components: [], embeds: [], content: "`loading...`" });
        await i.update({
          content: "",
          embeds: [mEmbed],
          components: [mRow],
          files: [gameImg],
        });
        vCollector.stop();
        return;
      }

      // Decline(btn)
      if (i.customId === "Decline") {
        await rep.edit({
          content: `\`\`\`${opponent.username} declined the match...\`\`\``,
          components: [],
          embeds: [],
        });
        await wait(3000);
        await rep.delete();
        vCollector.stop();
        return;
      }
    });

    let userScore = 0;
    let opponentScore = 0;
    const Winneremoji = "<:trophy:988122907815325758>";

    vCollector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await rep.delete();
        return;
      }
      const mCollector = rep.createMessageComponentCollector({
        time: 1000 * 60 * 90, // 90min
      });

      const channel = interaction.guild.channels.cache.get(
        rankLeaderboardChannel.channelId
      ) as TextChannel;

      mCollector.on("collect", async (i) => {
        if (mEmbed.data.fields === undefined) return;

        if (i.user.id !== user.id) {
          await i.reply({
            content: `These buttons aren't for you...`,
            ephemeral: true,
          });
          return;
        }

        // Player 1(btn)
        if (i.customId === user.username) {
          userScore++;
          mEmbed.data.fields[0].value = `**__Player1__ (${userScore})\n  \`1\` ${user}**`;

          if (userScore === rounds) {
            mEmbed.data.fields[2].value = `*~~__Player2__ (${opponentScore})\n  \`2\`  ${opponent}~~*`;
            mEmbed.setTitle(
              `${Winneremoji}\`\`\`${user.username} (${userScore} - ${opponentScore})\`\`\``
            );

            await i.update({
              embeds: [mEmbed],
              files: [gameImg],
              components: [],
            });
            await updateRankPlayersTimeLimit(user, opponent);
            await updatePlayerScore(user, opponent);
            await updateRankLeaderboardChannel(channel, true);
            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [mEmbed] });
          }
        }
        // Player 2(btn)
        if (i.customId === opponent.username) {
          opponentScore++;
          mEmbed.data.fields[2].value = `**__Player2__ (${opponentScore})\n  \`2\` ${opponent}**`;

          if (opponentScore === rounds) {
            mEmbed.data.fields[0].value = `*~~__Player1__ (${userScore})\n  \`1\`  ${user}~~*`;
            mEmbed.setTitle(
              `${Winneremoji}\`\`\`${opponent.username} (${userScore} - ${opponentScore})\`\`\``
            );

            await i.update({
              embeds: [mEmbed],
              files: [gameImg],
              components: [],
            });
            await updateRankPlayersTimeLimit(user, opponent);
            await updatePlayerScore(opponent, user);
            await updateLeaderboardChannel(channel, true);
            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [mEmbed] });
          }
        }

        // Reset(btn)
        if (i.customId === "Reset") {
          userScore = 0;
          opponentScore = 0;
          mEmbed.data.fields[0].value = `**__Player1__ (${userScore})\n  \`1\` ${user}**`;
          mEmbed.data.fields[2].value = `**__Player2__ (${opponentScore})\n  \`2\` ${opponent}**`;

          await i.update({ embeds: [mEmbed] });
        }

        // Delete(btn)
        if (i.customId === "Delete") {
          await rep.delete();
        }
      });
    });
  },
};
