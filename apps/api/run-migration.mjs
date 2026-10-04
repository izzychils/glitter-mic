// Standalone migration script - only needs DATABASE_URL
import { readFileSync } from "fs";
import pg from "pg";

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  console.error("Usage: node run-migration.mjs 'postgresql://user:pass@host/db'");
  console.error("   or: DATABASE_URL='postgresql://...' node run-migration.mjs");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("🔄 Connecting to database...");
    const client = await pool.connect();
    
    console.log("✅ Connected successfully");
    console.log("🔄 Running migrations...");

    const schemaSQL = readFileSync("./apps/api/src/db/schema.sql", "utf-8");
    await client.query(schemaSQL);

    console.log("✅ Migrations completed successfully!");
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
