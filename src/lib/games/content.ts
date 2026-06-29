import { GameContent } from "./types";
import type { GameId } from "./types";

/**
 * Loads and validates authored game content from src/content/games.
 * Real content files are <id>.json; *.example.json files are samples and are ignored.
 * Validation failures throw — a malformed game fails the build, never ships.
 */

// Bundled at build time. Glob is resolved by the bundler.
const modules = import.meta.glob<{ default: unknown }>(
  "../../content/games/*.json",
  {
    eager: true,
  },
);

const byId = new Map<GameId, GameContent>();

for (const [path, mod] of Object.entries(modules)) {
  if (path.includes(".example.")) continue;
  const parsed = GameContent.parse((mod as { default: unknown }).default);
  byId.set(parsed.id, parsed);
}

export function getGameContent(id: GameId): GameContent | null {
  return byId.get(id) ?? null;
}

export function allGameContent(): GameContent[] {
  return [...byId.values()];
}
