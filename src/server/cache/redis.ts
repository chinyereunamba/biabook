import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || "https://example.upstash.io";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "example_token";

// Avoid instantiating multiple redis clients in development
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    url,
    token,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
