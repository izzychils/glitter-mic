import session from "express-session";
import { Request, Response, NextFunction } from "express";
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
// connect-redis v7 passes options object, we need to extract TTL
const upstashRedisClient = {
  get: async (key: string) => {
    return await redis.get(key);
  },
  set: async (key: string, value: string, options?: any) => {
    // connect-redis v7 can pass { EX: ttl } or just ttl as number
    let ttl: number | undefined;
    
    if (typeof options === "number") {
      ttl = options;
    } else if (options && typeof options === "object" && "EX" in options) {
      ttl = options.EX;
    }
    
    if (ttl && ttl > 0) {
      // Upstash Redis uses EX option in set command
      return await redis.set(key, value, { ex: Math.floor(ttl) });
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
    // Don't set domain for cross-origin - let browser handle it
  },
});

/**
 * Middleware to restore session from X-Session-Token header if cookie is not available
 * This helps with browsers that block third-party cookies (like Safari)
 */
export function sessionHeaderFallback(req: Request, res: Response, next: NextFunction) {
  // If session already exists via cookie, continue
  if (req.session && req.session.userId) {
    return next();
  }

  // Check for session token in header
  const sessionToken = req.headers["x-session-token"] as string;
  if (!sessionToken) {
    return next();
  }

  // Try to load session from Redis using the token
  const sessionKey = `glitter-mic:session:${sessionToken}`;
  redis
    .get(sessionKey)
    .then((sessionData) => {
      if (sessionData && typeof sessionData === "string") {
        try {
          const parsed = JSON.parse(sessionData);
          if (parsed.userId) {
            // Manually attach session data
            req.session.userId = parsed.userId;
            req.session.username = parsed.username;
          }
        } catch (error) {
          // Invalid session data, ignore
        }
      }
      next();
    })
    .catch(() => {
      // Error loading session, continue anyway
      next();
    });
}

