# Wedding Games

A small bilingual (FR/EN) PWA for Colt & Valentine's wedding in Burgundy, August 2026. Guests play one mini-game a day for the five days before the wedding, scores accumulate, and a champion is crowned at the reception.

Private, friends-only, mobile-first, short-lived. Built to be cheap to run, low-maintenance, and rock-solid on the actual wedding days.

## The loop

Tap a link → land logged in → play today's game (~2 min) → get a score and a shareable card → paste it in the guest WhatsApp group → check the leaderboard → come back tomorrow.

## Stack

- **Next.js** (App Router) on **Vercel**
- **Supabase** (Postgres + Auth; anonymous sign-in behind a name pick)
- **Tailwind** for mobile-first styling
- **next-intl** for FR/EN
- **PWA** (installable, fast on phones)

See `docs/ARCHITECTURE.md` for why, and `docs/DECISIONS.md` for the open calls and the reasoning behind them.

## Repo layout

```
docs/                Architecture, decisions, scoring, deployment, content format, lessons
src/
  app/               Next.js App Router (routes, layouts)
  components/        Shared UI
  content/games/     Bilingual game content (typed, version-controlled — NOT in the DB)
  lib/
    games/           Game registry + shared game types
    scoring/         Score normalization, leaderboard, tiebreakers
    i18n/            Locale handling
    share/           Wordle-style share-card generation
    supabase/        DB client + queries
messages/            UI string translations (en.json, fr.json)
supabase/
  migrations/        SQL schema
  seed/              Guest-list seed (example only; real list is private)
public/              PWA manifest + icons
```

## Quickstart (once content + secrets are in place)

```bash
nvm use                 # Node version pinned in .nvmrc
npm install
cp .env.example .env    # add Supabase URL + anon key (omit them to run in mock mode)
npm run dev             # http://localhost:3000
```

## How content works

Colt & Valentine own all game content and deliver it finished, in both languages, in the structured format described in `docs/CONTENT-FORMAT.md`. Content lives in `src/content/games/` as version-controlled, type-validated data — not in a CMS or the database. Scores and guests live in Supabase.

## Status

UI complete. The Supabase backend (name-pick sign-in, scoring, live leaderboard) is wired and verified end to end against the live project, and the app is deployed to Vercel at `wedding.cdbradley.com`. Production needs the Supabase env vars set in Vercel to leave mock mode, and the real guest list still has to replace the test list before launch. See **`docs/STATUS.md`** for exactly where things stand and the next actions.
