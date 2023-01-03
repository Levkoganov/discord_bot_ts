import { Client, Collection, GatewayIntentBits } from "discord.js";

import { TSlashCommandData } from "../../types";

export class ExtendedClient extends Client {
  commands: Collection<string, TSlashCommandData> = new Collection();

  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
  }
}
