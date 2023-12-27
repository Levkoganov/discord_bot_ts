import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";

export const ACCEPTBTNROW = new ActionRowBuilder<ButtonBuilder>()
  // Btn(1)
  .addComponents(new ButtonBuilder().setCustomId("Accept").setLabel("Accept").setStyle(ButtonStyle.Primary))

  // Btn(2)
  .addComponents(new ButtonBuilder().setCustomId("Decline").setLabel("Decline").setStyle(ButtonStyle.Danger));

export const matchClickableBtnsRow = (user: User, opponent: User) =>
  new ActionRowBuilder<ButtonBuilder>()
    // Btn(1)
    .addComponents(new ButtonBuilder().setCustomId(user.username).setLabel(user.username).setStyle(ButtonStyle.Primary))

    // Btn(2)
    .addComponents(new ButtonBuilder().setCustomId(opponent.username).setLabel(opponent.username).setStyle(ButtonStyle.Success))

    // Btn(3)
    .addComponents(new ButtonBuilder().setCustomId("Reset").setLabel("RESET 🔄").setStyle(ButtonStyle.Secondary))

    // Btn(4)
    .addComponents(new ButtonBuilder().setCustomId("Delete").setLabel("DELETE ❌").setStyle(ButtonStyle.Secondary));
