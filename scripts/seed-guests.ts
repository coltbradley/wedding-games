/**
 * Loads the guest list into Supabase from a CSV (email,display_name,...).
 * Idempotent: upserts on email, so re-running won't duplicate. Uses the
 * service-role key (server only).
 *
 * Usage:
 *   npm run seed:guests -- path/to/guests.csv           # upsert only
 *   npm run seed:guests -- path/to/guests.csv --prune   # ...and delete guests
 *                                                       # not in the CSV
 *
 * --prune is what makes swapping the test list for the real one a true swap:
 * without it, upsert leaves every old row on the name-pick roster. Pruning a
 * guest cascades away their game_results (0001 FK) and unbinds nothing else.
 * The CSV parser handles a UTF-8 BOM and quoted fields, because the real list
 * will come out of a spreadsheet export.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2).filter((a) => a !== "--prune");
const prune = process.argv.includes("--prune");
const csvPath = args[0] ?? "supabase/seed/guests.example.csv";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.",
  );
  process.exit(1);
}

/** Minimal RFC-4180 CSV parse: quoted fields, escaped quotes, CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

// Strip the BOM Excel's "CSV UTF-8" export prepends — without this the first
// header reads "﻿email" and every email is silently dropped.
const rawText = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const [cols, ...rows] = parseCsv(rawText).map((r) => r.map((c) => c.trim()));

// Columns the guests table knows about. Any others in the CSV (internal
// working columns) are ignored, so the content team can keep extras.
const KNOWN = [
  "email",
  "display_name",
  "first_name",
  "preferred_locale",
  "side",
  "rsvp_status",
];

const guests = rows.map((cells, n) => {
  const row = Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? ""]));
  const guest: Record<string, string> = {};
  for (const key of KNOWN) {
    if (row[key])
      guest[key] = key === "email" ? row[key].toLowerCase() : row[key];
  }
  if (!guest.email || !guest.display_name) {
    console.error(`Row ${n + 2}: missing email or display_name — aborting.`);
    process.exit(1);
  }
  return guest;
});

const emails = new Set(guests.map((g) => g.email));
if (emails.size !== guests.length) {
  console.error("Duplicate emails in the CSV — aborting.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { error } = await supabase
  .from("guests")
  .upsert(guests, { onConflict: "email" });
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`Seeded ${guests.length} guests from ${csvPath}.`);

if (prune) {
  const { data: existing, error: listErr } = await supabase
    .from("guests")
    .select("id, email, display_name");
  if (listErr) {
    console.error("Prune failed listing guests:", listErr.message);
    process.exit(1);
  }
  const stale = (existing ?? []).filter((g) => !emails.has(g.email));
  if (stale.length === 0) {
    console.log("Prune: nothing to remove.");
  } else {
    const { count } = await supabase
      .from("game_results")
      .select("id", { count: "exact", head: true })
      .in(
        "guest_id",
        stale.map((g) => g.id),
      );
    const { error: delErr } = await supabase
      .from("guests")
      .delete()
      .in(
        "id",
        stale.map((g) => g.id),
      );
    if (delErr) {
      console.error("Prune failed:", delErr.message);
      process.exit(1);
    }
    console.log(
      `Pruned ${stale.length} guests not in the CSV` +
        (count ? ` (cascaded ${count} game results)` : "") +
        `: ${stale.map((g) => g.display_name).join(", ")}`,
    );
  }
} else {
  console.log("Tip: add --prune to remove guests no longer in the CSV.");
}
