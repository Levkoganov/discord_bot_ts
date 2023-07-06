import {
  SlashCommandBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import acceptionEmbed from "../helpers/embed/acceptionEmbed";
import shadowGameMatchEmbed from "../helpers/embed/matchEmbed";
import updateShadowGameRole from "../services/updateShadowGameRole";
import {
  checkShadowGameTimeLimit,
  updateShadowGameTimeLimit,
} from "../services/shadowGameTimeLimit";
import { numberOfRoundsOption } from "../constants/gameOptionsFunc";
import { authorizeUserCommand } from "../services/authorizeUserCommand";
import { ACCEPTBTNROW, matchClickableBtnsRow } from "../constants/btnRows";
import { filterInteraction } from "../services/filterUserInteractions";

export = {
  data: new SlashCommandBuilder()
    .setName("shadowgame")
    .setDescription("Choose the challenger")
    .addNumberOption((option) => numberOfRoundsOption(option))
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

    const roleName = "Niftar";
    const user = interaction.user;
    const opponent = interaction.options.getUser("opponent", true);
    const rounds = interaction.options.getNumber("rounds", true);
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === roleName
    );

    const isUserAuthorize = await authorizeUserCommand(
      interaction,
      user,
      opponent,
      role
    );

    if (!isUserAuthorize) return;

    const startImageString = "shadowRealm.png";
    const startGameImg = new AttachmentBuilder(
      `./public/img/${startImageString}`
    );

    const endImageString = "yugioh-anime.gif";
    const endGameImg = new AttachmentBuilder(`./public/img/${endImageString}`);

    const acceptBtnRow = ACCEPTBTNROW;
    const acceptEmbed = acceptionEmbed(opponent);

    const matchEmbed = shadowGameMatchEmbed(user, opponent, rounds, true);
    const matchBtnRow = matchClickableBtnsRow(user, opponent);

    let userScore = 0;
    let opponentScore = 0;
    const ripEmoji = "<:headstone:1069609034866491482>";

    const rep = await interaction.reply({
      embeds: [acceptEmbed],
      components: [acceptBtnRow],
      fetchReply: true,
    });

    const acceptCollector = rep.createMessageComponentCollector({
      time: 1000 * 60 * 2, // 2min
    });

    acceptCollector.on("collect", async (i) => {
      const isBtnClickedByChallenger = await filterInteraction(i, opponent);
      if (!isBtnClickedByChallenger) return;

      // Accept(btn)
      if (i.customId === "Accept") {
        await rep.edit({ components: [], embeds: [], content: "`loading...`" });
        matchEmbed.setImage(`attachment://${startImageString}`);

        await i.update({
          content: "",
          embeds: [matchEmbed],
          components: [matchBtnRow],
          files: [startGameImg],
        });
        acceptCollector.stop();
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
        acceptCollector.stop();
        return;
      }
    });

    acceptCollector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await rep.delete();
        return;
      }

      const mCollector = rep.createMessageComponentCollector({
        time: 1000 * 60 * 90, // 90min
      });

      mCollector.on("collect", async (i) => {
        const isBtnClickedByChallenger = await filterInteraction(i, user);
        if (matchEmbed.data.fields === undefined) return;
        if (!isBtnClickedByChallenger) return;

        // Player 1(btn)
        if (i.customId === user.username) {
          userScore++;
          matchEmbed.data.fields[0].value = `**__Player1__ (${userScore})\n  \`1\` ${user}**`;

          if (userScore === rounds) {
            matchEmbed.data.fields[2].value = `*~~__Player2__ (${opponentScore})\n  \`2\`  ${opponent}~~*`;
            matchEmbed.setTitle(
              `${ripEmoji}\`\`\`${opponent.username} has been banished to the shadow realm...\n\nyou may reedem yourself by typing: /escape\`\`\``
            );
            matchEmbed.setImage(`attachment://${endImageString}`);

            await i.update({
              embeds: [matchEmbed],
              files: [endGameImg],
              components: [],
            });

            const loser = interaction.guild.members.cache.get(opponent.id);
            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, opponent.id);
            await updateShadowGameRole(loser, role!);

            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [matchEmbed] });
          }
        }

        // Player 2(btn)
        if (i.customId === opponent.username) {
          opponentScore++;
          matchEmbed.data.fields[2].value = `**__Player2__ (${opponentScore})\n  \`2\` ${opponent}**`;

          if (opponentScore === rounds) {
            matchEmbed.data.fields[0].value = `*~~__Player1__ (${userScore})\n  \`1\`  ${user}~~*`;
            matchEmbed.setTitle(
              `${ripEmoji}\`\`\`${user.username} has been banished to the shadow realm...\n\nyou may reedem yourself by typing: /escape\`\`\``
            );

            matchEmbed.setImage(`attachment://${endImageString}`);
            await i.update({
              embeds: [matchEmbed],
              files: [endGameImg],
              components: [],
            });
            const loser = interaction.guild.members.cache.get(user.id);
            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, user.id);
            await updateShadowGameRole(loser, role!);

            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [matchEmbed] });
          }
        }

        // Reset(btn)
        if (i.customId === "Reset") {
          userScore = 0;
          opponentScore = 0;
          matchEmbed.data.fields[0].value = `**__Player1__ (${userScore})\n  \`1\` ${user}**`;
          matchEmbed.data.fields[2].value = `**__Player2__ (${opponentScore})\n  \`2\` ${opponent}**`;

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
