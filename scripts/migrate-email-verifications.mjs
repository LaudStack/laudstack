import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ehnlovnzpfvaxwwmgppj.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmxvdm56cGZ2YXh3d21ncHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI1NDE2OCwiZXhwIjoyMDg4ODMwMTY4fQ.aCOyOrFHgQ2r25KdYN9xhMbuwR3-M-HeK0maqRl5-xo";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const SQL = `
CREATE TABLE IF NOT EXISTS email_verifications (
  id serial PRIMARY KEY NOT NULL,
  email varchar(256) NOT NULL,
  supabase_id varchar(128) NOT NULL,
  code varchar(6) NOT NULL,
  expires_at timestamp NOT NULL,
  used_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL
);
`;

const { data, error } = await supabase.rpc("exec_sql", { query: SQL }).maybeSingle();

if (error) {
  // Try direct SQL via the query endpoint
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    }
  );
  const result = await response.text();
  console.log("RPC result:", result);
} else {
  console.log("Migration successful:", data);
}
