# Status — resume here

The single "where are we / what's next" doc. Read this first when picking the project back up.

## One-line state

App complete, Supabase backend wired and verified end to end, and deployed to Vercel at `wedding.cdbradley.com` on the live backend. The Supabase env vars are set on Vercel (Production + Preview) and a fresh build has inlined them, so production is out of mock mode. What remains before launch is swapping the 22 test guests for the real list and wiping `game_results`.

## Where things live

- **Repo:** `github.com/coltbradley/wedding-games`, branch `main` (pushed). Local: `~/Documents/code/wedding-games`.
- **Live site:** `wedding.cdbradley.com` (Vercel).
- **Design source:** Claude Design project "Wedding Games Design Brief" (id in `~/.claude` memory). Watercolour assets exported into `public/assets/`.
- **Supabase project:** ref `alqedfrfxswyiysbgusd`. MCP server config in `.mcp.json` (committed; no secret in it).

## Done

- Full UI: all 10 screens, faithful port of the design prototype. Bilingual FR/EN with instant toggle. Mobile, tablet, desktop layouts.
- Real game content (`src/content/games/*.json`, validated) and compressed watercolour imagery.
- Sign-in: name-pick + remember-on-device, no email. Optional shared event code via `NEXT_PUBLIC_EVENT_CODE` (default off). See `docs/DECISIONS.md` #2.
- Backend wired and proven against the live project: migrations `0001`/`0002`/`0003_harden` applied, 22 test guests seeded, anonymous sign-ins enabled. A smoke test passed all checks: anonymous sign-in, `link_me` binding, RLS (own writes allowed, cross-guest writes blocked), score persistence, idempotent re-link, leaderboard read. DB left pristine (0 results, 0 bound, 22 guests).
- Deployed to Vercel and verified on production: the desktop Games/Board nav and the bigger, scroll-collapsing imagery are live.

### Fixed this session

- **Wordle scores never persisted.** It was the only game with no submission path (the others submit via `finishGame`; the wordle solve handler only updated local state). Now submits on completion. The most important game, since it is day 1.
- **Desktop lost all navigation and the leaderboard.** The Games/Board switch lived only in the mobile bottom bar, hidden at >=1024px. Added a Games/Board switch to the desktop top band.
- **`0003_harden` migration** cleared the security-definer-view advisor (leaderboard view is now `security_invoker`) and locked `link_me` to authenticated users.
- **Bigger, scroll-collapsing imagery.** The game hero is taller and collapses to a slim sticky band on scroll; hub image enlarged; château made responsive.
- **Node engine pinned** to `22.x` for Vercel.
- **Leaderboard reworked to per-game + all-time.** The old Today/All-time toggle was confusing (and "today" shows 0 outside the event week, since no game is unlocked yet). Replaced with a scrollable chip row: All-time (cumulative) plus one board per game, each ranking only the guests who played that game on the same 0–1000 scale, which is a fairer head-to-head. The online Connections (day 5) stays on the leaderboard like the other games; the separate offline in-person Connections finale is not in the app and not on the board (see CLAUDE.md).
- **Sign-in didn't stick, and re-sign-in failed.** The session was stored in a JS-set cookie, which iOS Safari evicts (and standalone PWAs isolate), so phones forgot the guest; then tapping the name again minted a new anonymous user that `link_me` rejected with "someone's already playing as this guest." Fixed: the browser client now persists to localStorage (a cached singleton), sign-in reuses an existing session instead of minting a new one, the boot check uses `getSession` (no network round-trip), and migration `0004_link_me_rebind` rebinds the guest to whoever signs in (identity is honor-system). Verified: a session survives cookie loss, and a guest bound to an orphaned session signs straight back in.
- **Sign-in self-heals an orphaned session.** A stored session can outlive its anonymous auth user (e.g. a test wipe of `auth.users`), which made `link_me` fail and surfaced as "something went wrong" with no escape. `signInWithName` now retries once with a fresh anonymous user. This matters at launch: the pre-launch data wipe would otherwise lock out every already-signed-in guest.

The hard-won gotchas behind these fixes are written up in `docs/LESSONS.md`.

## Not done

- Real guest list not loaded (22 test guests are seeded; swap before launch).
- Domain `wedding.cdbradley.com` connected; confirm `noindex` is live in production.
- ~~GitHub secrets for the keep-warm Action~~ — done. `SUPABASE_URL` + `SUPABASE_ANON_KEY` are set and the `keep-supabase-warm` workflow ran green, so the free project will not go dormant before the event.

## Next actions, in order

1. **Done — Supabase env vars are set on Vercel (Production + Preview) and a fresh production build has inlined them.** Verified: the live bundle on `wedding.cdbradley.com` contains the Supabase URL, and an anonymous REST read of `guests` with the publishable key returns all 22 rows. The vars are stored as Vercel "Sensitive" type, so `vercel env pull` shows them blank — that is expected, not a sign they are unset. Build-time vars: any future change to them needs a redeploy to take effect.
2. **Verify on production (in a browser):** real guest list loads (not the mock Valentine/Léa/Margaux roster), a wordle score persists, the leaderboard reads live, and a reload stays signed in.
3. **Before launch:** swap the test guest list for the real one, wipe `game_results`, run the pre-launch checklist in `docs/DEPLOYMENT.md`.
4. ~~Add the GitHub keep-warm secrets.~~ Done — secrets set, workflow verified green.

## Open decisions (none blocking)

- Whether to require a shared guest code (`NEXT_PUBLIC_EVENT_CODE`). Currently off.
- Email-OTP sign-in stays a deliberate non-goal; can be added later in ~10 min if ever wanted.

## Timeline

Games run Fri Jul 31 to Tue Aug 4, 2026; reveal at the reception Wed Aug 5. Content locked ~2 weeks before.
