import { NextResponse } from "next/server";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { tools } from "@/drizzle/schema";
import { count } from "drizzle-orm";

export async function GET() {
  const checks: Record<string, unknown> = {};

  const dbUrl = process.env.DATABASE_URL ?? "";

  // Show connection info (mask password)
  try {
    const url = new URL(dbUrl);
    checks.db_host = url.hostname;
    checks.db_port = url.port;
    checks.db_user = url.username;
    checks.db_name = url.pathname;
    checks.db_password_length = url.password.length;
  } catch {
    checks.db_url_parse_error = "Failed to parse DATABASE_URL";
    checks.db_url_first_50 = dbUrl.substring(0, 50);
  }

  // Check env vars
  checks.NEXT_PUBLIC_SUPABASE_URL = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  checks.SUPABASE_SERVICE_ROLE_KEY = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Test DB connection with explicit config
  try {
    const sql = postgres(dbUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
      connect_timeout: 10,
      max: 1,
    });
    const db = drizzle(sql);
    const result = await db.select({ count: count() }).from(tools);
    checks.db_connected = true;
    checks.tool_count = result[0].count;
    await sql.end();
  } catch (error) {
    checks.db_connected = false;
    checks.db_error = error instanceof Error ? error.message : String(error);
    checks.db_error_name = error instanceof Error ? error.name : "unknown";
  }

  // Also try a raw SQL connection to test
  try {
    const sql = postgres(dbUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
      connect_timeout: 10,
      max: 1,
    });
    const result = await sql`SELECT count(*) as cnt FROM tools`;
    checks.raw_sql_connected = true;
    checks.raw_tool_count = result[0].cnt;
    await sql.end();
  } catch (error) {
    checks.raw_sql_connected = false;
    checks.raw_sql_error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(checks);
}
