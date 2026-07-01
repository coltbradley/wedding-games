# Architecture

A small, mobile-first PWA for a known, closed audience playing for one week. Optimized for cheap, low-maintenance, fast on phones, and reliable on the wedding days. Deliberately not over-engineered.

## Pieces

```
            ┌─────────────────────────────────────────┐
   phone    │  Next.js PWA (App Router) on Vercel      │
  ───────►  │   - guest sign-in (tap name, no email)   │
            │   - today's game + catch-up              │
            │   - leaderboard (per-game / all-time)    │
            │   - share-card generation (client)       │
            └───────────────┬─────────────────────────┘
                            │  @supabase/supabase-js
                            ▼
            ┌─────────────────────────────────────────┐
            │  Supabase                                │
            │   - Auth (anonymous, bound to a guest)   │
            │   - Postgres (guests, game_results)      │
            │   - Row-Level Security                   │
            └─────────────────────────────────────────┘

   No email provider: sign-in is name-pick + anonymous auth,
   so there is no OTP mail to deliver. With the Supabase env
   keys absent the app falls back to a mock client for local
   play. Game content is NOT in this picture: it's typed data
   in the repo (src/content/games), bundled at build time.
```

## Where state lives

- **Content (static):** `src/content/games/*.json`, validated by zod at build, bundled into the app. Words, questions, categories, bilingual copy. Changes via a git commit + redeploy. See `docs/CONTENT-FORMAT.md`.
- **Guests + scores (runtime):** Supabase Postgres. The only things that change while the app is live.
- **Session:** persisted on the device after sign-in, so returning each day is one tap.

## Data model (see `supabase/migrations/0001_init.sql`)

- **`guests`** — pre-loaded. `id`, `email` (unique, a stable key), `display_name`, `first_name`, `preferred_locale` (nullable), `side`, `rsvp_status`, `auth_user_id` (the bound device session, migration 0002), `created_at`. The roster the name pick reads from. Column privileges (migration 0005) keep `email`/`side`/`rsvp_status` unreadable from the browser — the anon key ships in the bundle, so anything granted is public.
- **`game_results`** — one row per guest per game. `guest_id`, `game_id` (`wordle`…`connections`), `correctness` (0–1), `score` (0–1000, normalized), `elapsed_ms`, `detail` (jsonb: per-game specifics for the share card — e.g. Wordle guess pattern), `created_at`. Unique on `(guest_id, game_id)` — playing again updates, doesn't duplicate.
- Leaderboard, daily winners, streaks, and tiebreakers are all **derived** from `game_results` (a SQL view or query), never stored. One source of truth, so the live board and the reception reveal can't disagree.

## Request flow for playing a game

1. Guest opens today's game; the client records the start time (session duration is a leaderboard tiebreaker).
2. Guest plays entirely client-side (content is already bundled).
3. On finish, the client builds a raw result (correctness fraction, elapsed ms, per-game detail), normalizes it through the shared scoring lib (`src/lib/scoring`), and upserts the `game_results` row. The write is retried once and the result card shows saved / didn't-save honestly.
4. Client renders the score and a Wordle-style share card (`src/lib/games/logic.ts`).

Scoring runs **on the client** through one shared, deterministic lib — there is no server component. RLS restricts writes to the guest's own row and the DB check-constrains the ranges (score 0–1000, correctness 0–1), but a motivated guest could fabricate a result. That's an accepted trade for a private, honor-system wedding game; if stricter trust were ever needed, the same scoring lib moves into an edge function with no UI change.

## Daily unlock

A small helper (`src/lib/games`) maps today's Europe/Paris date to the unlocked day index. Past days are playable (catch-up); future days are locked. Timezone is fixed to Paris regardless of the guest's device.

## i18n

No framework. A React context (`src/components/app/LangContext.tsx`) over one bilingual strings table (`src/lib/strings.ts`) gives an instant FR/EN toggle with no routing or cookies. The choice persists to localStorage, defaults from the browser language, and syncs `<html lang>`. Game content carries its own `en`/`fr` per the content format. Language-sensitive game state (the Wordle answer, the Connections grid) is pinned to the language the game started in, so mid-game toggles can't re-grade a board.

## Security posture (intentionally light)

Private, friends-only, `noindex`. Row-Level Security so a guest can only write their own results; leaderboard reads are public (display names + scores, not sensitive) and column privileges keep emails out of reach of the shipped anon key (migration 0005). The whole thing comes down after the wedding. This is a wedding game, not a bank — reliability and friction matter far more than hardening.

## Reliability on the day (the thing that actually matters)

- Static content bundled at build → a content/CMS outage can't take a game down.
- Vercel + Supabase both have generous free tiers and strong uptime at this scale.
- Sign-in has no email dependency at all — name-pick + anonymous auth can't be spam-filtered.
- Saved results rehydrate on boot, so a reload or a new day never forgets what a guest played.
- Pre-launch checklist in `docs/DEPLOYMENT.md`.
