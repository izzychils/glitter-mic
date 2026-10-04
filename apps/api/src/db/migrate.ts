import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pool } from "../lib/db";
import { logger } from "../lib/logger";

async function migrate() {
  try {
    logger.info("Running database migrations...");

    const schemaSQL = readFileSync(join(__dirname, "schema.sql"), "utf-8");

    await pool.query(schemaSQL);

    logger.info("✓ Database migrations completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Migration failed", error);
    process.exit(1);
  }
}

migrate();
