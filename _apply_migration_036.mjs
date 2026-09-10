import { readFileSync } from "fs";

const PROJECT_REF = "dryzyqylkettdftokoxc";
const token = process.env.SUPABASE_MGMT_TOKEN;
if (!token) throw new Error("SUPABASE_MGMT_TOKEN not set");

const sql = readFileSync("supabase/migrations/036_p1_action_pitch_demo_room.sql", "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: sql })
});

const text = await res.text();
console.log(JSON.stringify({ status: res.status, ok: res.ok, body: text.slice(0, 800) }));
