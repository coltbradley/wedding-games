# Scoring

The goal: every game counts comparably (no single day runs away with the result), getting it right is what matters, and showing up on the day is worth a little. Being quick never earns points — it only breaks ties — so slower readers, second-language players, and grandparents compete on even footing. Catch-up is always allowed and costs only the day-of bonus.

All constants here live in one config file (`src/lib/scoring/config.ts`) so they're tunable without touching logic.

## Per-game score (0–1000)

Each game yields a normalized score out of 1000, split into two parts:

```
score = correctness_points + day_of_bonus
```

- **Correctness (up to 900).** The fraction you got right × 900.
  - Wordle solved: based on guesses used (solved in 1 = full, in 6 = 1/6), scaled to 900.
  - Wordle missed: partial credit for the best row — 2 points per green and 1 per yellow, out of 10, scaled into at most 15% (`WORDLE_MISS_MAX`). A near-miss with four greens earns ~108; any solve still outranks any miss (solved-in-6 = 150).
  - Trivia / Two Truths / Travel: (correct answers ÷ total) × 900.
  - Connections: `max(0, groups found ÷ 4 − 0.05 × wrong guesses) × 900`. Only groups the player actually found count — the end-of-game reveal after a fourth mistake is presentation, not achievement. The penalty constant lives in `src/lib/games/result.ts` (`CONN_MISTAKE_PENALTY`).
- **Day-of bonus (flat 100).** Awarded for finishing the game on the day it opened. "The day" is the Paris calendar date, extended to 09:00 Paris the next morning so far-west guests keep their whole evening (midnight California is 09:00 Paris) (`isUnlockDay` in `src/lib/games/registry.ts`). This is the anticipation mechanic in point form: the ritual is rewarded, and catching up later costs exactly this and nothing more.

Session duration is still recorded (floored at 3 seconds, anti-fluke) but only feeds the tiebreakers below. Scoring runs on the client through the shared lib — honor-system by design, with DB range constraints as the backstop; see the trust note in `docs/ARCHITECTURE.md`. A finished game can't be replayed (the client rehydrates saved results on boot and reopens the result card instead), so a score can't be overwritten by a re-run.

## Cumulative champion

```
total = sum of each game's normalized score
```

Because catch-up is allowed, by the reception everyone _can_ have played all five, so summing is fair. A guest who skipped a game simply has a 0 for it; a guest who caught up late has at most 100 less per game than a day-of player with the same answers.

## Per-game boards

The in-app leaderboard is a chip row: All-time (cumulative) plus one board per game, each ranking only the guests who played that game on the same 0–1000 scale. Five chances to be on top of something, plus the overall crown.

## Tiebreakers (deterministic, in order — implemented in the board sort)

1. Higher `total` (or the game's score, on a per-game board).
2. More games played (rewards showing up every day).
3. Lower total session time across all games — this is where being quick counts, and the only place.
4. Earlier **first result** timestamp (when they first played, not when they were seeded — seeding gives everyone the same `created_at`).
5. Display name, alphabetically (the never-reached backstop that makes the order fully total).

## Streak badge

A light "played every day" honor for anyone with a result on all five games (`isStreak` in `src/lib/scoring/score.ts`). Not worth points and not shown in-app — it's read off the data at the reception.

## What the reception reveal needs

- The cumulative leaderboard, top to bottom, no ties (tiebreakers guarantee it).
- Per-game winners (the per-game boards, or a query over `game_results`).
- The list of streak-badge holders.
- All computed from the same `game_results` rows the live leaderboard uses — nothing special-cased for the reveal, so what guests saw all week and what's announced are consistent.
