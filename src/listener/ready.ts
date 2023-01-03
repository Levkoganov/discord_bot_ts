import { Client, Events } from "discord.js";
import mongodb_connection from "../config/mongodb_connection";
import deploy_commands from "../helpers/deploy_commands";

export default (client: Client): void => {
  client.once(Events.ClientReady, () => {
    mongodb_connection(process.env.MONGODB_URI);
    deploy_commands();
  });
};
