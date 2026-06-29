# Architecture

A small, mobile-first PWA for a known, closed audience playing for one week. Optimized for cheap, low-maintenance, fast on phones, and reliable on the wedding days. Deliberately not over-engineered.

## Pieces

```
            ┌─────────────────────────────────────────┐
   phone    │  Next.js PWA (App Router) on Vercel      │
  ───────►  │   - guest sign-in (OTP / name fallback)  │
            │   - today's game + catch-up              │
            │   - leaderboard (today / all-time)       │
            │   - share-card generation (client)       │
            └───────────────┬─────────────────────────┘
                            │  @supabase/ssr
                            ▼
            ┌─────────────────────────────────────────┐
            │  Supabase                                │
            │   - Auth (email OTP, pre-loaded guests)  │
            │   - Postgres (guests, game_results)      │
            │   - Row-Level Security                   │
            └───────────────┬─────────────────────────┘
                            │  custom SMTP
                            ▼
            ┌─────────────────────────────────────────┐
            │  Resend / Postmark (authenticated domain)│
            │   - the OTP code email only              │
            └─────────────────────────────────────────┘

   Game content is NOT in this picture — it's typed data
   in the repo (src/content/games), bundled at build time.
```

## Where state lives

- **Content (static):** `src/content/games/*.json`, validated by zod at build, bundled into the app. Words, questions, categories, bilingual copy. Changes via a git commit + redeploy. See `docs/CONTENT-FORMAT.md`.
- **Guests + scores (runtime):** Supabase Postgres. The only things that change while the app is live.
- **Session:** persisted on the device after sign-in, so returning each day is one tap.

## Data model (see `supabase/migrations/0001_init.sql`)

- **`guests`** — pre-loaded. `id`, `email` (unique), `display_name`, `preferred_locale` (nullable), `created_at`. The roster for both the OTP email-match and the name-pick fallback.
- **`game_results`** — one row per guest per game. `guest_id`, `game_id` (`wordle`…`connections`), `correctness` (0–1), `score` (0–1000, normalized), `elapsed_ms`, `detail` (jsonb: per-game specifics for the share card — e.g. Wordle guess pattern), `created_at`. Unique on `(guest_id, game_id)` — playing again updates, doesn't duplicate.
- Leaderboard, daily winners, streaks, and tiebreakers are all **derived** from `game_results` (a SQL view or query), never stored. One source of truth, so the live board and the reception reveal can't disagree.

## Request flow for playing a game

1. Guest opens today's game. Server records a start timestamp (trusted clock for the speed bonus).
2. Guest plays entirely client-side (content is already bundled).
3. On finish, the client submits the raw result. The server computes correctness + normalized score (`src/lib/scoring`), writes/updates the `game_results` row.
4. Client renders the score and a Wordle-style share card (`src/lib/share`).

Scoring is computed server-side from submitted raw results so the numbers are trustworthy and consistent; the client never reports its own final score.

## Daily unlock

A small helper (`src/lib/games`) maps today's Europe/Paris date to the unlocked day index. Past days are playable (catch-up); future days are locked. Timezone is fixed to Paris regardless of the guest's device.

## i18n

`next-intl`, FR + EN. Locale in a cookie (default from `Accept-Language`), no URL prefix, visible toggle. UI strings in `messages/{en,fr}.json`; game content carries its own `en`/`fr` per the content format.

## Security posture (intentionally light)

Private, friends-only, `noindex`. Row-Level Security so a guest can only write their own results; leaderboard reads are public (first names + scores, not sensitive). No PII beyond name + email. The whole thing comes down after the wedding. This is a wedding game, not a bank — reliability and friction matter far more than hardening.

## Reliability on the day (the thing that actually matters)

- Static content bundled at build → a content/CMS outage can't take a game down.
- Vercel + Supabase both have generous free tiers and strong uptime at this scale.
- The name-pick + shared-code fallback means a total email-delivery failure still lets everyone play.
- Pre-launch checklist in `docs/DEPLOYMENT.md`, including the real-French-ISP email test.
