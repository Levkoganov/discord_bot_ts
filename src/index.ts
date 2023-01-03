import { config } from "dotenv";
import ready from "./listener/ready";
import interactionCreate from "./listener/interactionCreate";
import { ExtendedClient } from "./classes/extentedClient";
import { setSlashCommands } from "./helpers/setSlashCommands";
config();

const client = new ExtendedClient();

setSlashCommands(client);
ready(client); // Init configuration
interactionCreate(client); // Execute interaction

client.login(process.env.DISCORD_TOKEN);
