import {
  SlashCommandBuilder,
  CommandInteraction,
  GuildMemberRoleManager,
  AttachmentBuilder,
} from "discord.js";
import moment from "moment";
import shadowGameTimeLimit_sh from "../models/shadowGameTimeLimit_sh";
import { showTimer, timePassedInHours } from "../helpers/timeLimitCalculate";
import shadowRealmWelcomeEmbed from "../helpers/embed/shadowRealmWelcomeEmbed";
import { setTimeout as wait } from "node:timers/promises";

export = {
  data: new SlashCommandBuilder()
    .setName("escape")
    .setDescription("Escape the shadow realm"),

  async execute(
    interaction: CommandInteraction & GuildMemberRoleManager
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const user = interaction.user;
    const roleName = "Niftar";
    const role = interaction.member.roles.cache.find(
      (role) => role.name === roleName
    );

    if (role) {
      const currentLocalTime = moment().format();

      const lastLost = await shadowGameTimeLimit_sh
        .find({ loserId: user.id })
        .sort({ createdAt: -1 });

      const timePassInHours = timePassedInHours(
        currentLocalTime,
        lastLost[0].createdAt
      );

      const cooldown = showTimer(currentLocalTime, lastLost[0].createdAt);
      if (timePassInHours >= 1) {
        await interaction.reply({
          content: `\`you escaped the shadow realm!\nuntill next time...\``,
          ephemeral: true,
        });

        await wait(2000);
        const userMember = interaction.guild.members.cache.get(user.id);
        await userMember?.roles.remove(role);

        return;
      } else {
        const imageString = "shadowRealmWelcome.png";
        const gameImg = new AttachmentBuilder(`./public/img/${imageString}`);
        const embed = shadowRealmWelcomeEmbed(cooldown, imageString);

        await interaction.reply({
          embeds: [embed],
          files: [gameImg],
          ephemeral: true,
        });
        return;
      }
    } else {
      await interaction.reply({
        content: `\`\`\`Only thouse that's have been banished to the shadow realm may use this command..\`\`\``,
        ephemeral: true,
      });
      return;
    }
  },
};
