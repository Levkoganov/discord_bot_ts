import { CommandInteraction, Interaction, Events } from "discord.js";
import { ExtendedClient } from "../classes/extentedClient";

export default (client: ExtendedClient): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    await handleSlashCommand(client, interaction);
  });
};

const handleSlashCommand = async (
  client: ExtendedClient,
  interaction: CommandInteraction
): Promise<void> => {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
};
