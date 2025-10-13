import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve("supabase/.env") });

const DB_URL = process.env.SUPABASE_DB_URL!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dave@tastycheddar.com";

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    // Set admin email for this session
    if (ADMIN_EMAIL) {
      await client.query(`SELECT set_config('app.admin_email', $1, false);`, [ADMIN_EMAIL]);
    }

    // Read and execute migration
    const sql = fs.readFileSync(path.resolve("supabase/migrations/0006_complete_schema_with_auto_admin.sql"), "utf8");
    await client.query(sql);

    console.log("✅ Migration applied successfully");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});