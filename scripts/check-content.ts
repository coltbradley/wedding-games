/**
 * Validates every authored game file against the content schema and checks the
 * schedule is complete. Run in CI and before deploy so a malformed game never
 * ships. Usage: npm run content:check
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GameContent, GAME_IDS } from "../src/lib/games/types";

const dir = join(process.cwd(), "src/content/games");
const files = readdirSync(dir).filter(
  (f) => f.endsWith(".json") && !f.includes(".example."),
);

const seen = new Set<string>();
let failed = false;

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const result = GameContent.safeParse(raw);
  if (!result.success) {
    failed = true;
    console.error(
      `✗ ${file}\n${result.error.issues.map((i) => `   ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  } else {
    seen.add(result.data.id);
    console.log(`✓ ${file} (${result.data.id}, day ${result.data.day})`);
  }
}

const missing = GAME_IDS.filter((id) => !seen.has(id));
if (missing.length) {
  console.warn(`\n⚠ Not yet authored: ${missing.join(", ")}`);
}

if (failed) {
  console.error("\nContent check failed.");
  process.exit(1);
}
console.log(`\nContent OK (${seen.size}/${GAME_IDS.length} games authored).`);
