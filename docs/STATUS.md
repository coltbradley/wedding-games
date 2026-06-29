# Status — resume here

Last updated mid-build, before the Supabase backend is connected. This is the single "where are we / what's next" doc. Read this first when picking the project back up.

## One-line state

The app is complete and the Supabase backend is **live and verified end to end** — anonymous sign-in, `link_me` binding, RLS (own-writes allowed, cross-guest writes blocked), score persistence, and idempotent re-link all pass against the real project. Local `.env` has live keys. Remaining work is deploy to Vercel and the real guest list.

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

- "Anonymous sign-ins" not yet enabled in the Supabase dashboard (required for name-pick / remember-on-device). **This is the next blocker.** The MCP has no tool for auth config, so it's a manual dashboard toggle.
- `src/lib/data/supabase.ts` is wired but **not yet exercised against the live project** — needs a real local click-through once anonymous sign-ins is on.
- Not deployed to Vercel; domain `wedding.graphite.productions` not connected.
- Real guest list not loaded (test list of 22 is seeded; swap before launch).

## Next actions, in order

1. ~~Authenticate Supabase MCP.~~ Done.
2. ~~Apply `0001`/`0002`, seed test guests, verify.~~ Done — plus `0003_harden.sql` (cleared the security-definer-view advisor; locked `link_me` to authenticated). 22 guests seeded, `link_me` present, RLS on, leaderboard view returns rows. Local `.env` written with live URL + publishable key (gitignored), so the app is in real mode.
3. ~~Enable Anonymous sign-ins.~~ Done.
4. ~~Verify the real flow against the live project.~~ Done — backend smoke test passed all 7 checks (anon sign-in, link_me, RLS allow/deny, persistence, idempotent re-link); test artifacts wiped, seed back to pristine 22 guests / 0 results. A manual `npm run dev` click-through is still worth doing once for UI confidence, but the data layer is proven.
5. **Colt:** Vercel — import the repo, add env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (values in local `.env`), deploy, connect the domain (Part C in `docs/DEPLOYMENT.md`).
6. **Before launch:** swap the test guest list for the real one, wipe `game_results`, run the pre-launch checklist in `docs/DEPLOYMENT.md`. Optionally add GitHub secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` so keep-warm runs.

## Open decisions (none blocking)

- Whether to require a shared guest code (`NEXT_PUBLIC_EVENT_CODE`). Currently off.
- Whether to commit `.mcp.json` (no secret in it; left uncommitted for now).
- Email-OTP sign-in stays a deliberate non-goal; can be added later in ~10 min if ever wanted.

## Timeline

Games run Fri Jul 31 – Tue Aug 4, 2026; reveal at the reception Wed Aug 5. Content locked ~2 weeks before. "Live in 5 weeks" from late June ≈ the event itself.
