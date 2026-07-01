import { getGameContent } from "./content";
import type { GameId, Localized } from "./types";
import type { Lang } from "../strings";

/**
 * Adapts validated content (src/content/games/*.json) into the shapes the UI
 * screens consume. Swapping a content file flows straight through to the UI —
 * nothing here is hard-coded game data. Presentation-only meta (hero imagery,
 * schedule day) lives in GAME_META.
 */

export const GAME_ORDER: GameId[] = [
  "wordle",
  "trivia",
  "two-truths",
  "travel",
  "connections",
];

export interface GameMetaView {
  id: GameId;
  day: number;
  title: Localized;
  hero: string; // /public path; watercolour gradient shows if the file is absent
}

export const GAME_META: Record<GameId, GameMetaView> = {
  wordle: {
    id: "wordle",
    day: 1,
    title: localizedTitle("wordle"),
    hero: "/assets/grapes.jpg",
  },
  trivia: {
    id: "trivia",
    day: 2,
    title: localizedTitle("trivia"),
    hero: "/assets/bridge.jpg",
  },
  "two-truths": {
    id: "two-truths",
    day: 3,
    title: localizedTitle("two-truths"),
    hero: "/assets/street.jpg",
  },
  travel: {
    id: "travel",
    day: 4,
    title: localizedTitle("travel"),
    hero: "/assets/tea.jpg",
  },
  connections: {
    id: "connections",
    day: 5,
    title: localizedTitle("connections"),
    hero: "/assets/cheese.jpg",
  },
};

function localizedTitle(id: GameId): Localized {
  const c = getGameContent(id);
  return c?.title ?? { en: id, fr: id };
}

export function tx(v: Localized, lang: Lang): string {
  return v[lang];
}

// --- Wordle ---
export interface WordleView {
  answer: string; // 5 uppercase letters, per language
  hint: Localized | null;
}
export function wordleView(lang: Lang): WordleView {
  const c = getGameContent("wordle");
  if (c?.id !== "wordle") return { answer: "VOWED", hint: null };
  return { answer: c.answer[lang].toUpperCase(), hint: c.hint ?? null };
}

// --- Trivia ---
export interface TriviaQ {
  prompt: Localized;
  choices: Localized[];
  answerIndex: number;
}
export function triviaView(): TriviaQ[] {
  const c = getGameContent("trivia");
  return c?.id === "trivia" ? c.questions : [];
}

// --- Two truths ---
export interface TTRound {
  statements: Localized[];
  lieIndex: number;
}
export function twoTruthsView(): TTRound[] {
  const c = getGameContent("two-truths");
  return c?.id === "two-truths" ? c.rounds : [];
}

// --- Travel ---
export interface TravelItem {
  label: Localized;
  answer: "france" | "srilanka";
}
export function travelView(): TravelItem[] {
  const c = getGameContent("travel");
  return c?.id === "travel"
    ? c.items.map((i) => ({ label: i.label, answer: i.answer }))
    : [];
}

/**
 * Rounds/questions per game, derived from the content itself so an edit to a
 * JSON file can never leave the UI counting wrong. Wordle's 6 is the guess
 * budget; connections' 4 is the group count — both structural, not content.
 */
export function gameTotal(id: GameId): number {
  if (id === "wordle") return 6;
  if (id === "trivia") return triviaView().length;
  if (id === "two-truths") return twoTruthsView().length;
  if (id === "travel") return travelView().length;
  return 4;
}

// --- Connections (separate grid per language) ---
export interface ConnGroup {
  name: string;
  level: number;
  members: string[];
}
export function connectionsView(lang: Lang): ConnGroup[] {
  const c = getGameContent("connections");
  return c?.id === "connections" ? c.grids[lang].groups : [];
}
