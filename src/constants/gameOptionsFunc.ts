import { SlashCommandStringOption } from "discord.js";

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
      name: "Street Fighter VI",
      value: "Street_Fighter_VI",
    });
