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

// Configure Redis session store
export const sessionMiddleware = session({
  store: new (RedisStore as any)(session)({
    client: redis as any,
    prefix: "glitter-mic:session:",
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
