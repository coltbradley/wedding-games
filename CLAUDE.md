# CLAUDE.md

Guidance for Claude Code working in this repo.

> **Resuming?** Read `docs/STATUS.md` first — it's the live "where we are / what's next" doc.

## What this is

A small bilingual (FR/EN) PWA for Colt & Valentine's wedding, Burgundy, August 2026. Guests play one mini-game a day for five days, scores accumulate, a champion is crowned at the reception. Private, friends-only, mobile-first, short-lived. Read `README.md`, then `docs/DECISIONS.md` for the architecture rationale.

## The four goals (optimize for these when in doubt)

1. Anticipation — a daily reason to check in.
2. Near-zero friction to start — every extra step loses non-technical, all-ages guests.
3. Braggability — finishing a game produces a shareable card for the WhatsApp group.
4. A public payoff — the leaderboard reveal at the reception.

## Stack

Next.js (App Router) + Vercel, Supabase (Postgres + Auth), Tailwind, next-intl, PWA. Don't over-engineer — this is a one-week event for a few dozen known people.

## Where things live

- `docs/` — architecture, decisions (ADR-style), scoring, content format, deployment. Source of truth for the "why."
- `src/content/games/*.json` — bilingual game content, authored by Colt & Valentine, validated by zod (`src/lib/games/types.ts`). NOT in the database.
- `src/lib/games/` — content loader, schemas, the daily-unlock schedule (`registry.ts`).
- `src/lib/scoring/` — normalization + leaderboard ranking. Model is in `docs/SCORING.md`.
- `src/lib/share/` — Wordle-style share cards.
- `src/components/app/` — the live UI: `WeddingGamesApp` (shell + screen router), `game.tsx` (client state machine, ported from the design prototype), `LangContext` (instant FR/EN toggle), `chrome.tsx`, `ScheduleList`.
- `src/components/screens/` — one component per screen (Join, Hub, Wordle, Trivia, TwoTruths, Travel, Connections, Results, Leaderboard).
- `src/lib/games/view.ts` — adapts content JSON into UI view models. `logic.ts` — Wordle eval + share-card text. `strings.ts` — bilingual UI copy. `design/tokens.ts` — colours.
- `src/lib/supabase/` — browser + server clients, wired into the data layer (`src/lib/data/supabase.ts`).
- `supabase/migrations/` — schema. `supabase/seed/` — guest-list seeding.

## Conventions

- The UI is a faithful port of the Claude Design prototype ("Wedding Games Design Brief"). Fonts: Cormorant Garamond (display) + Inter. Palette in `design/tokens.ts`. Watercolour image assets go in `public/assets/` (gradient fallbacks show until then).
- The data layer (`src/lib/data`) auto-selects its backend by env keys. With `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, it uses the live Supabase backend (name-pick sign-in, scoring, leaderboard); without them it falls back to the mock client (`src/lib/mock-leaderboard.ts`) for local play. The backend is wired and verified end to end against the live project. `src/lib/scoring` + `registry.ts` hold the server-side model.
- Content is bundled at build time; guests + scores are the only runtime state.
- Scores are computed server-side from submitted raw results — the client never reports its own final score.
- "Speed" in scoring means session duration, never how early in the week someone played. Catch-up is always allowed and never penalized.
- Sign-in: name-pick + remember-on-device (anonymous auth, then the `link_me` RPC binds the device to a guest), with an optional shared event code (`NEXT_PUBLIC_EVENT_CODE`, default off). Email OTP is a deliberate non-goal. See `docs/DECISIONS.md` #2.
- Timezone is fixed to Europe/Paris for unlocks, regardless of device.

## Before committing

`npm run typecheck && npm run content:check && npm run build`

Do not run `npm run build` while `npm run dev` is running. The build overwrites `.next` and the dev server then throws `Cannot find module './99.js'`. Stop dev first.

## Gotchas (the full set is in `docs/LESSONS.md`)

- Auth session persists to **localStorage**, not cookies (iOS Safari and PWAs evict JS-set cookies). The client is plain `@supabase/supabase-js`, not `@supabase/ssr`. Don't switch it back.
- A stored session can outlive its auth user, so `signInWithName` self-heals (retry with a fresh anonymous user if `link_me` fails). Don't wipe `auth.users` while real sessions exist; it orphans phones.
- `link_me` rebinds the guest to whoever signs in (honor-system identity). Scores live on `guest_id`, so rebinding never loses results.
- Verify writes against the database, not the screen. The UI renders result cards and the leaderboard from client state, which hid two real bugs (wordle never saving, the old Today board reading 0).
- `NEXT_PUBLIC_*` vars are inlined at build time. Missing Supabase keys on Vercel fail silently into mock mode (fake roster, no persistence); fix by setting them and redeploying.

## Voice for docs

Colt's house style: sentence-case headings, no em dashes, no AI-filler vocabulary, prose over inline-header bullet lists. Match the existing docs.

## Out of scope for v1

Photos/albums, push notifications (WhatsApp is the channel), heavy compliance.

There are two different Connections games, don't conflate them. The **online** Connections is day 5 in the app (`src/components/screens/Connections.tsx`); it is scored and feeds the leaderboard like the other four games. The **offline** Connections is a separate in-person finale played at the reception; it is not in the app and not on the leaderboard.
