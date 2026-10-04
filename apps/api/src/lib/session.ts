import session from "express-session";
import RedisStore from "connect-redis";
import { redis } from "./redis";
import { env } from "./env";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

// Upstash Redis adapter for connect-redis
// connect-redis expects EX, but Upstash uses different syntax
const upstashRedisClient = {
  get: async (key: string) => {
    return await redis.get(key);
  },
  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) {
      return await redis.setex(key, ttl, value);
    }
    return await redis.set(key, value);
  },
  del: async (key: string) => {
    return await redis.del(key);
  },
  // Required by connect-redis but not used
  on: () => {},
  connect: () => {},
  disconnect: () => {},
};

// Configure Redis session store
export const sessionMiddleware = session({
  store: new RedisStore({
    client: upstashRedisClient as any,
    prefix: "glitter-mic:session:",
    ttl: 86400 * 7, // 7 days in seconds
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "glitter.sid",
  cookie: {
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  },
});
