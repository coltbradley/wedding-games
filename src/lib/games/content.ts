import { GameContent } from "./types";
import type { GameId } from "./types";

import wordle from "@/content/games/01-wordle.json";
import trivia from "@/content/games/02-trivia.json";
import twoTruths from "@/content/games/03-two-truths.json";
import travel from "@/content/games/04-travel.json";
import connections from "@/content/games/05-connections.json";

/**
 * Loads and validates authored game content. Each file is imported explicitly
 * and parsed through the zod schema, so a malformed game fails the build rather
 * than shipping broken. To add or swap content, edit the file and (if new) add
 * an import here. Authoring format: docs/CONTENT-FORMAT.md.
 */
const RAW: unknown[] = [wordle, trivia, twoTruths, travel, connections];

const byId = new Map<GameId, GameContent>();
for (const raw of RAW) {
  const parsed = GameContent.parse(raw);
  byId.set(parsed.id, parsed);
}

export function getGameContent(id: GameId): GameContent | null {
  return byId.get(id) ?? null;
}

export function allGameContent(): GameContent[] {
  return [...byId.values()];
}
