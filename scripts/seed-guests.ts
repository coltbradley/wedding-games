/**
 * Loads the guest list into Supabase from a CSV (email,display_name,preferred_locale).
 * Idempotent: upserts on email, so re-running won't duplicate. Uses the service-role
 * key (server only). Usage: npm run seed:guests -- path/to/guests.csv
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const csvPath = process.argv[2] ?? "supabase/seed/guests.example.csv";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.",
  );
  process.exit(1);
}

const [header, ...lines] = readFileSync(csvPath, "utf8").trim().split("\n");
const cols = header.split(",").map((c) => c.trim());

// Columns the guests table knows about. Any others in the CSV (first_name aside,
// e.g. internal working columns) are ignored, so the content team can keep extra
// columns without breaking seeding.
const KNOWN = [
  "email",
  "display_name",
  "first_name",
  "preferred_locale",
  "side",
  "rsvp_status",
];

const guests = lines.map((line) => {
  const cells = line.split(",").map((c) => c.trim());
  const row = Object.fromEntries(cols.map((c, i) => [c, cells[i]])) as Record<
    string,
    string
  >;
  const guest: Record<string, string> = {};
  for (const key of KNOWN) {
    if (row[key])
      guest[key] = key === "email" ? row[key].toLowerCase() : row[key];
  }
  return guest;
});

const supabase = createClient(url, serviceKey);

const { error } = await supabase
  .from("guests")
  .upsert(guests, { onConflict: "email" });
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`Seeded ${guests.length} guests from ${csvPath}.`);
