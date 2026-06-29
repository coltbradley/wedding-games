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
  - Connections: (groups solved ÷ 4) × 700, with a mistake penalty per wrong guess.
- **Speed bonus (up to 300).** Based on **session duration** — the clock starts when the game opens and stops when it's finished. Faster solve → bigger bonus, decaying to 0 at a per-game target time (`targetSeconds`). Capped so a fast clicker can't overtake someone who actually played well; correctness always dominates.

```
speed_bonus = 300 × clamp(1 − elapsedSeconds / targetSeconds, 0, 1)
```

Session duration is measured server-trusted where it matters: the start timestamp is recorded when the game is served, the finish when the result is submitted, and an implausibly fast time is floored (anti-fluke, not anti-cheat — this is a wedding).

## Cumulative champion

```
total = sum of each game's normalized score
```

Because catch-up is allowed, by the reception everyone _can_ have played all five, so summing is fair. A guest who skipped a game simply has a 0 for it.

## Daily winners

For each day, the top normalized score on that day's game. Independent of the cumulative race, so there are five "you won today" moments plus the overall crown.

## Tiebreakers (deterministic, in order)

1. Higher cumulative `total`.
2. More games played (rewards showing up every day).
3. Lower total session time across all games (the speed bonus already captures most of this; this is the final splitter).
4. Earlier first-ever sign-in (stable, arbitrary, guarantees no ties at the reveal).

## Streak badge

A light "played every day" badge for anyone with a result on all five games. Not worth points — it's a separate honor, revealed at the reception. Just enough to nudge people back.

## What the reception reveal needs

- The cumulative leaderboard, top to bottom, no ties (tiebreakers guarantee it).
- The five daily winners.
- The list of streak-badge holders.
- All computed from the same `game_results` rows the live leaderboard uses — nothing special-cased for the reveal, so what guests saw all week and what's announced are consistent.
