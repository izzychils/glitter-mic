import "dotenv/config";
import { z } from "zod";

/**
 * Some shells/tools export PORT=0 ("any free port"); treat 0/empty as unset so the
 * dev default wins instead of refusing to boot.
 */
const port = z.preprocess(
  (value) => (value === "" || value === "0" || value === 0 ? undefined : value),
  z.coerce.number().int().positive().default(4000)
);

/**
 * Every environment variable the API understands, validated at boot with Zod
 * (build guide Section 14: validate everything, fail fast).
 *
 * Database is intentionally NOT wired yet: per the user's instruction we skip
 * DB/deployment setup for now and will use Neon Postgres (not MongoDB) in Phase 7.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: port,
  /** Frontend origin allowed by CORS / Socket.IO. */
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),

  // Phase 2: Google auth
  JWT_SECRET: z.string().min(16).default("glitter-mic-dev-secret-change-me"),
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Phase 7: persistence + leaderboards (Neon Postgres instead of MongoDB)
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Phase 6: streaming speech-to-text
  DEEPGRAM_API_KEY: z.string().optional(),

  // Phase 3: song catalog
  JAMENDO_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
