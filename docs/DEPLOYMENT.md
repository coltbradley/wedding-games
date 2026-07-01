# Deployment & launch

Short-lived event app. Goal: stand it up cheaply, keep it boring, and be certain it works on the five days that matter. Sign-in is name-pick + remember-on-device, no email (see `docs/DECISIONS.md` #2), so there's no email provider or DNS-for-mail to set up.

## Environments

- **Local:** `npm run dev`. With no Supabase keys in `.env` it runs in **mock mode** (fully playable, scores not saved, placeholder board). Add keys to test the real backend.
- **Production:** Vercel at **`wedding.cdbradley.com`**, pointed at a Supabase project (`alqedfrfxswyiysbgusd`).

One Supabase project is fine for an event this small.

## Swapping in the real guest list (before launch)

Order matters here — do it as one sitting:

1. `npm run seed:guests -- real-guests.csv --prune` — upserts the real list and deletes the test guests (their results cascade away). Without `--prune`, the 22 test names stay on the name-pick roster next to the real ones.
2. Wipe remaining test plays: `delete from game_results;`.
3. If you also want to clear the anonymous auth users: **first** `update guests set auth_user_id = null;`, **then** delete the users (the FK blocks the other order). Safe before launch; never do it once real guests have signed in (see `docs/LESSONS.md` — it orphans phones, though sign-in now self-heals).

> Mock-mode trap: the env vars below are `NEXT_PUBLIC_*`, so they are inlined at **build** time. If they are missing from the Vercel build, the deployed app silently falls back to the mock client (a fake roster including Valentine, Léa, Margaux, and no real scores). If you see those names on the live site, the keys were not set. Add them in Vercel and **redeploy** (setting the vars without a fresh build does nothing).

## Secrets (`.env` locally; Vercel env vars in prod — never committed)

See `.env.example`. The essentials:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client. Their presence is what flips the app from mock to live.
- `SUPABASE_SERVICE_ROLE_KEY` — server only, used by the seed script. Never in the browser.
- `NEXT_PUBLIC_EVENT_CODE` — **optional**. Set it to require a shared guest code; leave unset for tap-your-name-and-go.

## One-time setup

1. Create the Supabase project. Run the migrations in `supabase/migrations/` in order: `0001_init.sql` through `0005_hide_guest_emails.sql`. (`0003` makes the leaderboard view `security_invoker` and locks the `link_me` RPC to authenticated users; `0004` lets a returning guest reclaim their name after their device loses its session; `0005` column-restricts guest reads so the shipped anon key can't list emails.)
2. In Supabase **Auth → Providers**, enable **Anonymous sign-ins** (the name-pick flow relies on it). The MCP cannot toggle this; it is a manual dashboard step.
3. Seed the guest list: `npm run seed:guests -- path/to/guests.csv` (see `supabase/seed/`). The parser handles spreadsheet exports (BOM, quoted fields); add `--prune` to also delete guests no longer in the CSV.
4. Deploy to Vercel from GitHub; add the env vars above, then redeploy so the build picks them up (see the mock-mode trap above). Point `wedding.cdbradley.com` at Vercel. Confirm `noindex` is live.
5. (Optional) Add GitHub secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` so the **keep-warm** Action (`.github/workflows/keep-warm.yml`) can stop the free project going dormant before launch.

## Supabase dormancy

Free projects pause after ~7 days of inactivity. During the wedding week, daily play keeps it awake. For the quiet weeks before, the keep-warm Action pings it every 3 days. If it ever does pause, un-pausing from the dashboard takes ~1 minute with no data loss. (Supabase Pro at $25/mo removes pausing entirely — turn it on for August and cancel after if you want zero anxiety; not necessary with the ping.)

## Pre-launch checklist (do these, don't skip)

- [ ] Walk the full loop on a real phone: tap your name → confirm → play → score → copy the share card → paste into a WhatsApp chat → tap the link back in.
- [ ] Confirm the share card pastes cleanly in WhatsApp (emoji grid intact, link tappable, no spoilers).
- [ ] Confirm the session persists: reload the page, you should stay signed in (not bounced to the name list).
- [ ] Lock every game's content file and confirm `npm run content:check` passes.
- [ ] Confirm Paris-time unlock behaves: today's game open, tomorrow's locked (dimmed with its open date), yesterday's catchable. Before launch day the hub shows the countdown card. (`NEXT_PUBLIC_UNLOCK_ALL=1` opens everything for preview testing — make sure it is NOT set in production.)
- [ ] Add to Home Screen on a real iPhone: the V &amp; C monogram icon appears, the app opens standalone with the cream splash, and the tab bar clears the home indicator.
- [ ] Reload mid-week: played games still show their checkmarks and result cards (state rehydrates from the DB).
- [ ] Load the leaderboard while signed out (it should be visible).
- [ ] If you set `NEXT_PUBLIC_EVENT_CODE`, pin a WhatsApp message with the app link and the code.

## During the week

- Each morning, confirm the day's game unlocked (a quick phone check).
- Drop the daily nudge + link in WhatsApp (manual — no notification system by design).

## After the wedding

- Export the final `game_results` and leaderboard if you want a keepsake.
- Take the app down (delete the Vercel deployment / pause the Supabase project). Private and short-lived by design.
