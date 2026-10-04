import { Redis } from "@upstash/redis";
import { env } from "./env";
import { logger } from "./logger";

// Upstash Redis client
export const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

// Test connection
redis
  .ping()
  .then(() => {
    logger.info("Redis connected successfully");
  })
  .catch((err) => {
    logger.error("Failed to connect to Redis", err);
  });
