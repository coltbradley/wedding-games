import { z } from "zod";

/**
 * Shared game types and the zod schemas that validate authored content.
 * Content authoring format is documented in docs/CONTENT-FORMAT.md.
 */

// Bilingual text appears everywhere in content.
export const Localized = z.object({
  en: z.string().min(1),
  fr: z.string().min(1),
});
export type Localized = z.infer<typeof Localized>;

export const GAME_IDS = [
  "wordle",
  "trivia",
  "two-truths",
  "travel",
  "connections",
] as const;
export type GameId = (typeof GAME_IDS)[number];

const Base = z.object({
  id: z.enum(GAME_IDS),
  day: z.number().int().min(1).max(5),
  title: Localized,
});

// --- Per-game content schemas ---

export const WordleContent = Base.extend({
  id: z.literal("wordle"),
  answer: z.object({
    en: z.string().regex(/^[A-Za-z]{5}$/),
    fr: z.string().regex(/^[A-Za-z]{5}$/),
  }),
  hint: Localized.optional(),
});

export const TriviaContent = Base.extend({
  id: z.literal("trivia"),
  questions: z
    .array(
      z.object({
        prompt: Localized,
        choices: z.array(Localized).min(2).max(4),
        answerIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const TwoTruthsContent = Base.extend({
  id: z.literal("two-truths"),
  rounds: z
    .array(
      z.object({
        statements: z.array(Localized).length(3),
        lieIndex: z.number().int().min(0).max(2),
      }),
    )
    .min(1),
});

export const TravelContent = Base.extend({
  id: z.literal("travel"),
  items: z
    .array(
      z.object({
        label: Localized,
        image: z.string().optional(),
        answer: z.enum(["france", "srilanka"]),
      }),
    )
    .min(1),
});

const ConnectionsGrid = z.object({
  groups: z
    .array(
      z.object({
        name: z.string().min(1),
        level: z.number().int().min(0).max(3),
        members: z.array(z.string().min(1)).length(4),
      }),
    )
    .length(4),
});

export const ConnectionsContent = Base.extend({
  id: z.literal("connections"),
  // Separate grid per language — wordplay doesn't translate. See CONTENT-FORMAT.md.
  grids: z.object({ en: ConnectionsGrid, fr: ConnectionsGrid }),
});

export const GameContent = z.discriminatedUnion("id", [
  WordleContent,
  TriviaContent,
  TwoTruthsContent,
  TravelContent,
  ConnectionsContent,
]);
export type GameContent = z.infer<typeof GameContent>;

/** A guest's result for one game, as submitted from the client (raw, pre-scoring). */
export interface RawResult {
  gameId: GameId;
  correctness: number; // 0..1, computed per game
  elapsedMs: number; // session duration, start-of-game to submit
  detail: Record<string, unknown>; // per-game specifics for the share card
}
