# Wedding Games

A small bilingual (FR/EN) PWA for Colt & Valentine's wedding in Burgundy, August 2026. Guests play one mini-game a day for the five days before the wedding, scores accumulate, and a champion is crowned at the reception.

Private, friends-only, mobile-first, short-lived. Built to be cheap to run, low-maintenance, and rock-solid on the actual wedding days.

## The loop

Tap a link → land logged in → play today's game (~2 min) → get a score and a shareable card → paste it in the guest WhatsApp group → check the leaderboard → come back tomorrow.

## Stack

- **Next.js** (App Router) on **Vercel**
- **Supabase** (Postgres + Auth; anonymous sign-in behind a name pick)
- **Tailwind** for mobile-first styling
- **Lightweight FR/EN toggle** (a React context over one bilingual strings table — no i18n framework)
- **PWA** (installable, fast on phones)

See `docs/ARCHITECTURE.md` for why, and `docs/DECISIONS.md` for the open calls and the reasoning behind them.

## Repo layout

```
docs/                Architecture, decisions, scoring, deployment, content format, lessons
src/
  app/               Next.js App Router (routes, layouts)
  components/        App shell + one component per screen
  content/games/     Bilingual game content (typed, version-controlled — NOT in the DB)
  lib/
    games/           Content schemas, unlock schedule, game logic + share cards
    scoring/         Score normalization + tiebreakers
    data/            Backend seam (mock client / Supabase client)
    design/          Colour + shape tokens
    strings.ts       Bilingual UI copy (FR/EN)
    supabase/        Browser client
supabase/
  migrations/        SQL schema
  seed/              Guest-list seed (example only; real list is private)
public/              PWA manifest + icons + watercolour assets
scripts/             Content check, guest seeding, icon generation
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

App and backend are wired end to end and deployed to Vercel at `wedding.cdbradley.com` on the live Supabase project. The daily unlock schedule, score persistence across reloads, and PWA install assets are in place. What remains before launch is swapping the 22 test guests for the real list (`npm run seed:guests -- real.csv --prune`) and the pre-launch checklist. See **`docs/STATUS.md`** for exactly where things stand and the next actions.
