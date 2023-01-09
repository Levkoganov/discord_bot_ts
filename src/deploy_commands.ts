import { readdirSync } from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes, SlashCommandBuilder } from "discord.js";
import { TSlashCommandData } from "../types";

export default (): void => {
  const commandList = slashCommandsList();
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commandList.map((command) => command.toJSON()) }
    )
    .then(() => console.log("Successfully registered application commands."))
    .catch((err) => console.error(err));
};

const slashCommandsList = (): SlashCommandBuilder[] => {
  const commands: SlashCommandBuilder[] = [];
  const commandsPath = join(__dirname, "./commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command: TSlashCommandData = require(filePath);
    commands.push(command.data);
  }

  return commands;
};
