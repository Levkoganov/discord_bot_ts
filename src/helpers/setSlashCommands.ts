import { readdirSync } from "fs";
import { join } from "path";
import { ExtendedClient } from "../classes/extentedClient";
import { TSlashCommandData } from "../../types";
import { Collection } from "@discordjs/collection";

export const setSlashCommands = (clientCommand: ExtendedClient): void => {
  clientCommand.commands = new Collection();

  const commandsPath = join(__dirname, "../commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  ); // Get all "commands" files

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command: TSlashCommandData = require(filePath);
    clientCommand.commands.set(command.data.name, command);
  }
};
