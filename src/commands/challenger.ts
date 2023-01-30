import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  GuildMemberRoleManager,
  MessageComponentInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import champion_sh from "../models/champion_sh";
import { ISetChampion } from "../../types";
import {
  checkChallengerCooldown,
  updateLoserCooldown,
} from "../services/kothTimeLimit";
import getGameImg from "../helpers/getGameImg";
import kothMatchEmbed from "../helpers/embed/matchEmbed";
import updateKothWinStreak from "../services/updateKothWinStreak";
import channel_sh from "../models/channel_sh";
import updateKothLeaderboardChannel from "../services/updateLeaderboardChannel";
import findAndUpdateChampion from "../services/findAndUpdateChampion";
import updateKothRole from "../services/updateKothRole";

export = {
  data: new SlashCommandBuilder()
    .setName("challenger")
    .setDescription("Choose the challenger")

    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select game")
        .setRequired(true)
        .addChoices({
          name: "Dragonball FighterZ",
          value: "Dragonball_FighterZ",
        })
        .addChoices({
          name: "GG Strive",
          value: "GG_Strive",
        })
        .addChoices({
          name: "DNF Duel",
          value: "DNF_Duel",
        })
        .addChoices({
          name: "Tekken7",
          value: "Tekken7",
        })
        .addChoices({
          name: "Guilty Gear Xrd Rev 2",
          value: "Guilty_Gear_Xrd_Rev_2",
        })
        .addChoices({
          name: "BlazBlue CF",
          value: "BlazBlue_CF",
        })
        .addChoices({
          name: "MultiVersus",
          value: "MultiVersus",
        })
        .addChoices({
          name: "Brawlhalla",
          value: "Brawlhalla",
        })
        .addChoices({
          name: "Street Fighter V",
          value: "Street_Fighter_V",
        })
    )

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

    const game = interaction.options.getString("game", true);
    const challenger = interaction.options.getUser("challenger", true);
    const kothRoleName = "KOTH - Champion";
    const champion = interaction.user;
    const champions = await champion_sh.find({ userId: champion.id });
    const { id } = interaction.guild;
    const kothLeaderboardChannel = await channel_sh.findOne({ guildId: id });
    const isCurrentGameChampion = validateCurrentGameChampion(champions, game);
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === kothRoleName
    );

    if (!isCurrentGameChampion) {
      await interaction.reply({
        content: `Only the \`${game}\` champion can use this command`,
        ephemeral: true,
      });
      return;
    }

    if (champion.id === challenger.id) {
      await interaction.reply({
        content: "You cannot select yourself as a challenger...",
        ephemeral: true,
      });
      return;
    }

    if (role === undefined) {
      await interaction.reply({
        content: `\`"KOTH - Champion"\` **__role__** doesn't exist.\nplease create this role before using this command`,
        ephemeral: true,
      });
      return;
    }

    if (kothLeaderboardChannel === null) {
      await interaction.reply({
        content: `Please use \`/set-channel\` before using this command`,
        ephemeral: true,
      });
      return;
    }

    const { cooldown, isBlocked } = await checkChallengerCooldown(
      challenger,
      game
    );
    if (isBlocked) {
      await interaction.reply({
        content: `**The \`Opponent\` can challenge the \`Champion\` once every \`12 hours\`**.\n\n\`CHALLENGER: (${challenger.username})\`\n\`GAME: (${game})\` \`\`\`time passed: ${cooldown} (HH:mm:ss)\`\`\``,
        ephemeral: true,
      });
      return;
    }

    const rounds = interaction.options.getNumber("rounds", true);
    const imgPathString = getGameImg(game);
    const gameImg = new AttachmentBuilder(`./public/img/${imgPathString}`);
    const Winneremoji = "<:trophy:988122907815325758>";

    const matchEmbed = kothMatchEmbed(
      champion,
      challenger,
      rounds,
      false,
      game,
      imgPathString
    );

    const row = new ActionRowBuilder<ButtonBuilder>()
      // Btn(1)
      .addComponents(
        new ButtonBuilder()
          .setCustomId(champion.username)
          .setLabel(champion.username)
          .setStyle(ButtonStyle.Primary)
      )

      // Btn(2)
      .addComponents(
        new ButtonBuilder()
          .setCustomId(challenger.username)
          .setLabel(challenger.username)
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
      embeds: [matchEmbed],
      components: [row],
      files: [gameImg],
      fetchReply: true,
    });

    const filter = async (i: MessageComponentInteraction) => {
      if (i.user.id === champion.id) return true;
      else {
        await i.reply({
          content: `These buttons aren't for you...`,
          ephemeral: true,
        });
        return false;
      }
    };

    const collector = rep.createMessageComponentCollector({
      filter,
      time: 1000 * 60 * 90, // 90min
    });

    let championScore = 0;
    let challengerScore = 0;
    const channel = interaction.guild.channels.cache.get(
      kothLeaderboardChannel.channelId
    ) as TextChannel;

    collector.on("collect", async (i) => {
      if (matchEmbed.data.fields === undefined) return;

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

          collector.stop();
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
            `${Winneremoji}\`\`\`${champion.username} (${championScore} - ${challengerScore})\`\`\``
          );

          await i.update({
            embeds: [matchEmbed],
            files: [gameImg],
            components: [],
          });

          const challengerMember = interaction.options.getMember("challenger");
          const prevChampion = await findAndUpdateChampion(game, challenger);

          await updateKothRole(
            interaction,
            prevChampion?.userId,
            role,
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

    collector.on("end", (collected) =>
      console.log(`Collected ${collected.size} items`)
    );
  },
};

function validateCurrentGameChampion(
  champions: ISetChampion[],
  game: string
): boolean {
  for (const champion of champions) {
    if (champion.game === game) return true;
  }

  return false;
}
