import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager, AttachmentBuilder } from "discord.js";
import moment from "moment";
import shadowGameTimeLimit_sh from "../models/shadowGameTimeLimit_sh";
import { showTimer, timePassedInHours } from "../helpers/timer_func/timeLimitCalculate";
import shadowRealmWelcomeEmbed from "../helpers/embed_func/shadowRealmWelcomeEmbed";
import { setTimeout as wait } from "node:timers/promises";
import { roleNames } from "../constants/constants";

export = {
  data: new SlashCommandBuilder().setName("escape").setDescription("Escape the shadow realm"),

  async execute(interaction: CommandInteraction & GuildMemberRoleManager): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const user = interaction.user;
    const role = interaction.member.roles.cache.find((role) => role.name === roleNames.Niftar);

    // Check if "role" exist
    if (role) {
      const currentLocalTime = moment().format();
      const lastLost = await shadowGameTimeLimit_sh.find({ loserId: user.id }).sort({ createdAt: -1 });

      // Check if user has a "lost" (unexpected edge case)
      if (lastLost.length === 0) {
        await interaction.reply({
          content: `\`you escaped the shadow realm!\nuntill next time...\``,
          ephemeral: true,
        });
        const userMember = interaction.guild.members.cache.get(user.id);
        await wait(2000);
        await userMember?.roles.remove(role);

        return;
      }

      const timePassInHours = timePassedInHours(currentLocalTime, lastLost[0].createdAt)
      // Check if an "Hour" passed since the user lost
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
        const imageString = "shadowRealm.png";
        const gameImg = new AttachmentBuilder(`./public/img/${imageString}`);
        const cooldown = showTimer(currentLocalTime, lastLost[0].createdAt);
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
        content: `\`\`\`Only those that have been banished to the shadow realm may use this command..\`\`\``,
        ephemeral: true,
      });
      return;
    }
  },
};
