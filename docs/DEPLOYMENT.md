# Deployment & launch

Short-lived event app. Goal: stand it up cheaply, keep it boring, and be certain it works on the five days that matter. Sign-in is name-pick + remember-on-device, no email (see `docs/DECISIONS.md` #2), so there's no email provider or DNS-for-mail to set up.

## Environments

- **Local:** `npm run dev`. With no Supabase keys in `.env` it runs in **mock mode** (fully playable, scores not saved, placeholder board). Add keys to test the real backend.
- **Production:** Vercel at **`wedding.graphite.productions`**, pointed at a Supabase project.

One Supabase project is fine for an event this small. Wipe `game_results` before go-live so test plays don't pollute the real board (`delete from game_results;`).

## Secrets (`.env` locally; Vercel env vars in prod — never committed)

See `.env.example`. The essentials:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client. Their presence is what flips the app from mock to live.
- `SUPABASE_SERVICE_ROLE_KEY` — server only, used by the seed script. Never in the browser.
- `NEXT_PUBLIC_EVENT_CODE` — **optional**. Set it to require a shared guest code; leave unset for tap-your-name-and-go.

## One-time setup

1. Create the Supabase project. Run `supabase/migrations/0001_init.sql` then `0002_auth_link.sql` in the SQL editor.
2. In Supabase **Auth → Providers**, enable **Anonymous sign-ins** (the name-pick flow relies on it).
3. Seed the guest list: `npm run seed:guests -- path/to/guests.csv` (see `supabase/seed/`).
4. Deploy to Vercel from GitHub; add the env vars above. Point `wedding.graphite.productions` at Vercel. Confirm `noindex` is live.
5. (Optional) Add GitHub secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` so the **keep-warm** Action (`.github/workflows/keep-warm.yml`) can stop the free project going dormant before launch.

## Supabase dormancy

Free projects pause after ~7 days of inactivity. During the wedding week, daily play keeps it awake. For the quiet weeks before, the keep-warm Action pings it every 3 days. If it ever does pause, un-pausing from the dashboard takes ~1 minute with no data loss. (Supabase Pro at $25/mo removes pausing entirely — turn it on for August and cancel after if you want zero anxiety; not necessary with the ping.)

## Pre-launch checklist (do these, don't skip)

- [ ] Walk the full loop on a real phone: tap your name → confirm → play → score → copy the share card → paste into a WhatsApp chat → tap the link back in.
- [ ] Confirm the share card pastes cleanly in WhatsApp (emoji grid intact, link tappable, no spoilers).
- [ ] Confirm the session persists: reload the page, you should stay signed in (not bounced to the name list).
- [ ] Lock every game's content file and confirm `npm run content:check` passes.
- [ ] Confirm Paris-time unlock behaves: today's game open, tomorrow's locked, yesterday's catchable.
- [ ] Load the leaderboard while signed out (it should be visible).
- [ ] If you set `NEXT_PUBLIC_EVENT_CODE`, pin a WhatsApp message with the app link and the code.

## During the week

- Each morning, confirm the day's game unlocked (a quick phone check).
- Drop the daily nudge + link in WhatsApp (manual — no notification system by design).

## After the wedding

- Export the final `game_results` and leaderboard if you want a keepsake.
- Take the app down (delete the Vercel deployment / pause the Supabase project). Private and short-lived by design.
