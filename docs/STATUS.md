# Status — resume here

Last updated mid-build, before the Supabase backend is connected. This is the single "where are we / what's next" doc. Read this first when picking the project back up.

## One-line state

The app is complete and runs in **mock mode** (no backend keys needed). The real backend is **written but not yet connected** to Supabase. Next action is authenticating the Supabase MCP, then running migrations + seeding.

## Where things live

- **Repo:** `github.com/coltbradley/wedding-games`, branch `main` (pushed). Local: `~/Documents/code/wedding-games`.
- **Design source:** Claude Design project "Wedding Games Design Brief" (id in `~/.claude` memory). Watercolour assets already exported into `public/assets/`.
- **Supabase project:** created, ref `alqedfrfxswyiysbgusd`. MCP server added to `.mcp.json` (uncommitted) but **not yet authenticated**.

## Done

- Full UI: all 10 screens (join, name-pick, hub, 5 games, results/share card, leaderboard), faithful port of the design prototype. Bilingual FR/EN with instant toggle. Mobile + tablet + desktop layouts.
- Real game content (`src/content/games/*.json`, validated) and compressed watercolour imagery.
- Sign-in decided and built: **name-pick + remember-on-device, no email.** Shared guest code is optional via `NEXT_PUBLIC_EVENT_CODE` (default off = tap name, confirm, in). See `docs/DECISIONS.md` #2.
- Backend code: data-layer abstraction (`src/lib/data`, mock + supabase impls, auto-selected by env keys), score submission, live-leaderboard query, migrations `0001_init.sql` + `0002_auth_link.sql`, keep-warm GitHub Action.
- Verified: `npm run typecheck`, `npm run content:check` (5/5), `npm run build`, and a full browser click-through of mock mode all pass.

## Not done / untested

- Supabase migrations not yet run; guest list not seeded.
- Everything in `src/lib/data/supabase.ts` is **untested against a live project** (mock mode is what's been exercised).
- "Anonymous sign-ins" not yet enabled in the Supabase dashboard (required for remember-on-device).
- Not deployed to Vercel; domain `wedding.graphite.productions` not connected.
- Real guest list not loaded (only the test CSV exists).

## Next actions, in order

1. **Colt:** restart Claude Code → approve the project MCP server → run `/mcp` → authenticate **supabase** (browser OAuth). Then say "connected."
2. **Claude (via Supabase MCP):** apply `0001_init.sql` and `0002_auth_link.sql`; seed the test guest list; verify (guests present, `link_me` function exists, RLS enabled). Report whether the MCP can toggle Anonymous sign-ins or if it's a dashboard step.
3. **Colt (dashboard):** enable **Authentication → Anonymous sign-ins** if the MCP can't.
4. **Colt → Claude:** test the real flow locally with keys in `.env` (tap name → play → score saved → leaderboard updates → reload stays signed in).
5. **Colt:** Vercel — import the repo, add env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, deploy, connect the domain (Part C in `docs/DEPLOYMENT.md`).
6. **Before launch:** swap the test guest list for the real one, wipe `game_results`, run the pre-launch checklist in `docs/DEPLOYMENT.md`. Optionally add GitHub secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` so keep-warm runs.

## Open decisions (none blocking)

- Whether to require a shared guest code (`NEXT_PUBLIC_EVENT_CODE`). Currently off.
- Whether to commit `.mcp.json` (no secret in it; left uncommitted for now).
- Email-OTP sign-in stays a deliberate non-goal; can be added later in ~10 min if ever wanted.

## Timeline

Games run Fri Jul 31 – Tue Aug 4, 2026; reveal at the reception Wed Aug 5. Content locked ~2 weeks before. "Live in 5 weeks" from late June ≈ the event itself.
