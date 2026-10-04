import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  logger.error("Unexpected database error", err);
});

// Test connection
pool.query("SELECT NOW()", (err) => {
  if (err) {
    logger.error("Failed to connect to database", err);
  } else {
    logger.info("Database connected successfully");
  }
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`Query executed in ${duration}ms: ${res.rowCount} rows`);
    return res.rows;
  } catch (error) {
    logger.error("Query error", { text, error });
    throw error;
  }
}
