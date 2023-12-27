import { SlashCommandNumberOption, SlashCommandStringOption } from "discord.js";

export const gamesOption = (option: SlashCommandStringOption) =>
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
      name: "Tekken7",
      value: "Tekken7",
    })
    .addChoices({
      name: "Tekken8",
      value: "Tekken8",
    })
    .addChoices({
      name: "Guilty Gear Xrd Rev 2",
      value: "Guilty_Gear_Xrd_Rev_2",
    })
    .addChoices({
      name: "Granblue Fantasy Versus: Rising",
      value: "Granblue_Fantasy_Versus_Rising",
    })
    .addChoices({
      name: "Street Fighter 6",
      value: "Street_Fighter_6",
    });

export const numberOfRoundsOption = (option: SlashCommandNumberOption) =>
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
    });
