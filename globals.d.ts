declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_GUILD_ID: string;
      MONGODB_URI: string;
      BOT_ID: string;
    }
  }
}

export {};
