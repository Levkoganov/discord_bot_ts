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
import validationEmbed from "../helpers/embed/validationEmbed";
import matchEmbed from "../helpers/embed/matchEmbed";
import updateShadowGameRole from "../services/updateShadowGameRole";
import {
  checkShadowGameTimeLimit,
  updateShadowGameTimeLimit,
} from "../services/shadowGameTimeLimit";

export = {
  data: new SlashCommandBuilder()
    .setName("shadowgame")
    .setDescription("Choose the challenger")

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
    const user = interaction.user;
    const roleName = "Niftar";
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === roleName
    );

    if (role === undefined) {
      await interaction.reply({
        content: `\`${roleName}\` **__role__** doesn't exist.\nplease create this role before using this command`,
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

    const { cooldown, isBlocked } = await checkShadowGameTimeLimit(
      user,
      opponent
    );

    if (isBlocked) {
      await interaction.reply({
        content: `**You can do a \`shadowgame\` once every \`3 hours\` with the same opponent **.\n\`OPPONENT: (${opponent.username})\`\n\n\`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``,
        ephemeral: true,
      });
      return;
    }

    const startImageString = "shadowRealm.png";
    const startGameImg = new AttachmentBuilder(
      `./public/img/${startImageString}`
    );

    const endImageString = "yugioh-anime.gif";
    const endGameImg = new AttachmentBuilder(`./public/img/${endImageString}`);

    const vEmbed = validationEmbed(opponent);
    const vRow = new ActionRowBuilder<ButtonBuilder>()
      // Btn(1)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Accept")
          .setLabel("Accept")
          .setStyle(ButtonStyle.Primary)
      )

      // Btn(2)
      .addComponents(
        new ButtonBuilder()
          .setCustomId("Decline")
          .setLabel("Decline")
          .setStyle(ButtonStyle.Danger)
      );

    const mEmbed = matchEmbed(user, opponent, rounds, true);
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
        mEmbed.setImage(`attachment://${startImageString}`);

        await i.update({
          content: "",
          embeds: [mEmbed],
          components: [mRow],
          files: [startGameImg],
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
    const ripEmoji = "<:headstone:1069609034866491482>";

    vCollector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await rep.delete();
        return;
      }

      const mCollector = rep.createMessageComponentCollector({
        time: 1000 * 60 * 90, // 90min
      });

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
              `${ripEmoji}\`\`\`${opponent.username} has been banished to the shadow realm...\n\nyou may reedem yourself by typing: /escape\`\`\``
            );
            mEmbed.setImage(`attachment://${endImageString}`);

            await i.update({
              embeds: [mEmbed],
              files: [endGameImg],
              components: [],
            });

            const loser = interaction.guild.members.cache.get(opponent.id);
            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, opponent.id);
            await updateShadowGameRole(loser, role);

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
              `${ripEmoji}\`\`\`${user.username} has been banished to the shadow realm...\n\nyou may reedem yourself by typing: /escape\`\`\``
            );

            mEmbed.setImage(`attachment://${endImageString}`);
            await i.update({
              embeds: [mEmbed],
              files: [endGameImg],
              components: [],
            });
            const loser = interaction.guild.members.cache.get(user.id);
            await loser?.voice.disconnect();
            await updateShadowGameTimeLimit(user, opponent, user.id);
            await updateShadowGameRole(loser, role);

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
