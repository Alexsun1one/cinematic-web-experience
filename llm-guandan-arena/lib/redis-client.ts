import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

export function usesRedis(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export async function getRedis(): Promise<RedisClientType> {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");
  if (client?.isOpen) return client;
  if (!connecting) {
    const created = createClient({ url });
    created.on("error", (error) => {
      console.error("redis", error instanceof Error ? error.message : error);
    });
    connecting = created
      .connect()
      .then(() => {
        client = created as RedisClientType;
        return client;
      })
      .catch((error) => {
        connecting = null;
        throw error;
      });
  }
  return connecting;
}
