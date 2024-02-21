import {
  SlashCommandBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
  AttachmentBuilder,
} from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import acceptionEmbed from "../helpers/embed_func/acceptionEmbed";
import shadowGameMatchEmbed from "../helpers/embed_func/matchEmbed";
import updateShadowGameRole from "../helpers/db_func/updateShadowGameRole";
import { updateShadowGameTimeLimit } from "../helpers/timer_func/shadowGameTimeLimit";
import { numberOfRoundsOption } from "../constants/gameOptionsFunc";
import { validateUserCommand } from "../helpers/validation_func/validations";
import { ACCEPTBTNROW, matchClickableBtnsRow } from "../constants/btnRows";
import { filterInteraction } from "../helpers/validation_func/filterUserInteractions";
import { roleNames } from "../constants/constants";

export = {
  data: new SlashCommandBuilder()
    .setName("shadowgame")
    .setDescription("Choose the challenger")
    .addNumberOption((option) => numberOfRoundsOption(option))
    .addUserOption((option) =>
      option.setName("opponent").setDescription("Choose your opponent").setRequired(true)
    ),

  async execute(interaction: CommandInteraction & GuildMemberRoleManager): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    let roleCounter = 0;
    const user = interaction.user;
    const opponent = interaction.options.getUser("opponent", true);
    const rounds = interaction.options.getNumber("rounds", true);

    const role = interaction.guild.roles.cache.find((role) => {
      if (role.name === roleNames.Banisher) roleCounter++;
      if (role.name === roleNames.Niftar) roleCounter++;
      if (roleCounter === 2) return true;
    });

    const isUserAuthorize = await validateUserCommand(interaction, user, opponent, role);
    if (!isUserAuthorize) return;

    const imageString = "shadowRealm.png";
    const startGameImg = new AttachmentBuilder(`./public/img/${imageString}`);

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
      time: 1000 * 60 * 10, // 10min
    });

    acceptCollector.on("collect", async (i) => {
      const isBtnClickedByChallenger = await filterInteraction(i, opponent);
      if (!isBtnClickedByChallenger) return;

      // Accept(btn)
      if (i.customId === "Accept") {
        await rep.edit({ components: [], embeds: [], content: "`loading...`" });
        matchEmbed.setImage(`attachment://${imageString}`);

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
          content: `\`\`\`${opponent.username} declined the shadow game...\`\`\``,
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
            const winner = interaction.guild.members.cache.get(user.id);

            await updateShadowGameRole(loser, roleNames.Niftar, interaction);
            await updateShadowGameRole(winner, roleNames.Banisher, interaction);

            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, opponent.id);

            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [matchEmbed], files: [startGameImg] });
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
            const winner = interaction.guild.members.cache.get(opponent.id);

            await updateShadowGameRole(loser, roleNames.Niftar, interaction);
            await updateShadowGameRole(winner, roleNames.Banisher, interaction);

            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, user.id);

            mCollector.stop();
            return;
          } else {
            await i.update({ embeds: [matchEmbed], files: [startGameImg] });
          }
        }

        // Reset(btn)
        if (i.customId === "Reset") {
          userScore = 0;
          opponentScore = 0;
          matchEmbed.data.fields[0].value = `**__Player1__ (${userScore})\n  \`1\` ${user}**`;
          matchEmbed.data.fields[2].value = `**__Player2__ (${opponentScore})\n  \`2\` ${opponent}**`;

          await i.update({ embeds: [matchEmbed], files: [startGameImg] });
        }

        // Delete(btn)
        if (i.customId === "Delete") {
          await rep.delete();
        }
      });
    });
  },
};
