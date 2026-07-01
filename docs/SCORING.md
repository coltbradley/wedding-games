# Scoring

The goal: every game counts comparably (no single day runs away with the result), getting it right matters most, and being quick is a tiebreaker-grade bonus — where "quick" means **how long your play session took**, never **how early in the week you played**. Catch-up players are never penalized.

All constants here live in one config file (`src/lib/scoring/config.ts`) so they're tunable without touching logic.

## Per-game score (0–1000)

Each game yields a normalized score out of 1000, split into two parts:

```
score = correctness_points + speed_bonus
```

- **Correctness (up to 700).** The fraction you got right × 700.
  - Wordle: based on guesses used (solved in 1 = full, 6 = low, miss = 0), scaled to 700.
  - Trivia / Two Truths / Travel: (correct answers ÷ total) × 700.
  - Connections: `max(0, groups found ÷ 4 − 0.05 × wrong guesses) × 700`. Only groups the player actually found count — the end-of-game reveal after a fourth mistake is presentation, not achievement. The penalty constant lives in `src/lib/games/result.ts` (`CONN_MISTAKE_PENALTY`).
- **Speed bonus (up to 300).** Based on **session duration** — the clock starts when the game opens and stops when it's finished. Faster solve → bigger bonus, decaying to 0 at a per-game target time (`targetSeconds`). Capped so a fast clicker can't overtake someone who actually played well; correctness always dominates.

```
speed_bonus = 300 × clamp(1 − elapsedSeconds / targetSeconds, 0, 1)
```

Session duration is measured on the client (the clock starts at game open, stops at finish) and an implausibly fast time is floored at 3 seconds. Scoring itself also runs on the client through the shared lib — honor-system by design, with DB range constraints as the backstop; see the trust note in `docs/ARCHITECTURE.md`. Anti-fluke, not anti-cheat — this is a wedding. A finished game can't be replayed (the client rehydrates saved results on boot and reopens the result card instead), so a score can't be overwritten by a re-run with a warm start.

## Cumulative champion

```
total = sum of each game's normalized score
```

Because catch-up is allowed, by the reception everyone _can_ have played all five, so summing is fair. A guest who skipped a game simply has a 0 for it.

## Per-game boards

The in-app leaderboard is a chip row: All-time (cumulative) plus one board per game, each ranking only the guests who played that game on the same 0–1000 scale. Five chances to be on top of something, plus the overall crown.

## Tiebreakers (deterministic, in order — implemented in the board sort)

1. Higher `total` (or the game's score, on a per-game board).
2. More games played (rewards showing up every day).
3. Lower total session time across all games (the speed bonus already captures most of this; this is the final splitter).
4. Earlier **first result** timestamp (when they first played, not when they were seeded — seeding gives everyone the same `created_at`).
5. Display name, alphabetically (the never-reached backstop that makes the order fully total).

## Streak badge

A light "played every day" honor for anyone with a result on all five games (`isStreak` in `src/lib/scoring/score.ts`). Not worth points and not shown in-app — it's read off the data at the reception.

## What the reception reveal needs

- The cumulative leaderboard, top to bottom, no ties (tiebreakers guarantee it).
- Per-game winners (the per-game boards, or a query over `game_results`).
- The list of streak-badge holders.
- All computed from the same `game_results` rows the live leaderboard uses — nothing special-cased for the reveal, so what guests saw all week and what's announced are consistent.
