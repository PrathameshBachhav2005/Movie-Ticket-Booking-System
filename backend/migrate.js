import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "sql_class_2_db",
});

async function runMigration() {
  console.log("Connecting to the database...");
  try {
    const scriptPath = join(__dirname, 'migration.sql');
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    console.log("Running migration script...");
    await pool.query(sql);
    
    console.log("Migration executed successfully! ✅");
  } catch (error) {
    console.error("Migration failed ❌", error);
  } finally {
    await pool.end();
  }
}

runMigration();
