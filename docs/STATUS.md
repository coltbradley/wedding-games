# Status — resume here

The single "where are we / what's next" doc. Read this first when picking the project back up.

## One-line state

App complete including the daily unlock, replay protection, and PWA install assets; backend wired, hardened (migration 0005 applied to the live project), and deployed to Vercel at `wedding.cdbradley.com`. What remains before launch is swapping the 22 test guests for the real list (`--prune`), wiping `game_results`, and the pre-launch checklist.

## Where things live

- **Repo:** `github.com/coltbradley/wedding-games`, branch `main`. Local: `~/Documents/code/wedding-games`.
- **Live site:** `wedding.cdbradley.com` (Vercel).
- **Design source:** Claude Design project "Wedding Games Design Brief" (id in `~/.claude` memory). Watercolour assets exported into `public/assets/`.
- **Supabase project:** ref `alqedfrfxswyiysbgusd`. MCP server config in `.mcp.json` (committed; no secret in it).

## Done

- Full UI: all 10 screens, faithful port of the design prototype. Bilingual FR/EN with instant toggle (persisted, browser-language default). Mobile, tablet, desktop layouts.
- Real game content (`src/content/games/*.json`, zod-validated with range/uniqueness refinements) and compressed watercolour imagery.
- Sign-in: name-pick + remember-on-device, no email. Optional shared event code via `NEXT_PUBLIC_EVENT_CODE` (default off). See `docs/DECISIONS.md` #2.
- Backend wired and proven against the live project: migrations `0001`–`0005` applied, anonymous sign-ins enabled, keep-warm Action green. Column privileges (`0005`) verified live: anon reads of `email` are denied; roster and leaderboard reads work.
- **Daily unlock enforced.** The hub features today's game (countdown card before launch), future days render locked with their open date, and `openGame` refuses them. Paris-time day flip refreshes on an interval and on foreground. `NEXT_PUBLIC_UNLOCK_ALL=1` opens everything for previews.
- **Played state survives reloads and blocks replays.** Results rehydrate from `game_results` on boot (rich `detail` carries guesses/picks/language), a finished game reopens its result card, and double-submits are guarded. Score writes verify the upsert, retry once, and the result card shows saved / didn't-save with a retry.
- **Scoring reworked (2026-07-01), matches the doc.** Correctness up to 900 + flat 100 for playing on the day it opened (Paris date, grace to 09:00 next morning for US evenings); speed earns nothing and is only the time tiebreaker. Missed Wordle earns partial credit for the best row (max 135, below any solve). Connections only counts groups the player found (the four-mistake reveal is dimmed presentation, penalty 0.05/mistake). The leaderboard applies the deterministic tiebreakers (points, games played, total time, first result, name) on the all-time and per-game boards, and the result card shows a "played on the day · +100" chip.
- **Language-stable games.** The Wordle answer and Connections grid pin to the language the game started in, so the mid-game FR/EN toggle can't re-grade a board or swap tiles.
- **PWA install assets.** Generated V & C monogram icons (192/512/maskable/apple-touch, `scripts/gen-icons.mjs`), cream manifest colors, `viewport-fit=cover` with safe-area padding on the tab bar, `100dvh` screens.
- **Polish pass.** Accessible Wordle tile/keyboard contrast (dark text on gold/greige), roster + leaderboard loading skeletons and error/retry states, sign-in pending spinner, clipboard fallback (never claims "Copied!" falsely, shows a press-and-hold block if copy is impossible), reduced-motion support, focus-visible rings, pinch-zoom re-enabled, colour tokens centralized in `design/tokens.ts`.
- CI (`.github/workflows/ci.yml`): typecheck + content check + build on every push/PR.
- Docs truth pass: ARCHITECTURE / SCORING / DECISIONS / DEPLOYMENT / README / CLAUDE.md now describe the system as built (client-side scoring is stated honestly; next-intl and the dead `@supabase/ssr` server client are gone).

## Not done

- Real guest list not loaded (22 test guests are seeded; swap with `npm run seed:guests -- real.csv --prune` before launch).
- Production redeploy after this round of changes (icons, unlock, migration are code + DB; Vercel needs a fresh build).
- Domain `wedding.cdbradley.com` connected; confirm `noindex` is live in production.

## Next actions, in order

1. Deploy `main` to Vercel and spot-check production: hub shows the countdown card (pre-launch), Add to Home Screen shows the monogram icon, a wordle play persists and survives reload.
2. Before launch: swap the guest list (`--prune`), wipe `game_results`, run the pre-launch checklist in `docs/DEPLOYMENT.md` (it includes the unlock, PWA, and rehydration checks).
3. Content lock ~2 weeks before (mid-July): final pass over `src/content/games/*.json`, `npm run content:check`.

## Open decisions (none blocking)

- Whether to require a shared guest code (`NEXT_PUBLIC_EVENT_CODE`). Currently off.
- Email-OTP sign-in stays a deliberate non-goal; can be added later in ~10 min if ever wanted.

## Timeline

Games run Fri Jul 31 to Tue Aug 4, 2026; reveal at the reception Wed Aug 5. Content locked ~2 weeks before.
