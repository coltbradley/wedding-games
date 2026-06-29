# Deployment & launch

Short-lived event app. Goal: stand it up cheaply, keep it boring, and be certain it works on the five days that matter.

## Environments

- **Local:** `npm run dev`, pointed at a dev Supabase project.
- **Production:** Vercel, pointed at a prod Supabase project. Domain: **`wedding.graphite.productions`**. OTP email sends from an authenticated subdomain on the same root (e.g. `mail.wedding.graphite.productions`).

Keep dev and prod on **separate Supabase projects** so test data never pollutes the real leaderboard.

## Secrets (`.env`, never committed)

See `.env.example` for the full list. The essentials:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client.
- `SUPABASE_SERVICE_ROLE_KEY` — server only (seeding, score writes). Never exposed to the browser.
- Email provider key (`RESEND_API_KEY` or Postmark token) — wired into Supabase Auth SMTP, not the app directly.
- `EVENT_CODE` — the shared code for the name-pick fallback.
- `APP_TIMEZONE=Europe/Paris`, `LAUNCH_DATE=2026-07-31`.

## One-time setup

1. Create the prod Supabase project. Run `supabase/migrations/0001_init.sql`.
2. Configure custom SMTP in Supabase Auth (Resend/Postmark) on the authenticated sending subdomain (`mail.wedding.graphite.productions`). Set SPF, DKIM, DMARC DNS records.
3. Set the auth email template to show the **code** (`{{ .Token }}`), not the link. Keep it minimal.
4. Seed the guest list: `npm run seed:guests` from the real CSV (see `supabase/seed/`).
5. Point the custom domain at Vercel. Confirm `noindex` is live.

## Pre-launch checklist (do these, don't skip)

- [ ] Send a test OTP to a real **orange.fr**, a real **free.fr**, and a **Gmail** account of a non-technical relative. Confirm it lands in the inbox (check spam) within a minute.
- [ ] Verify the name-pick + shared-code fallback works end to end on a phone.
- [ ] Walk the full loop on an actual phone: sign in → play → score → copy share card → paste into a WhatsApp chat → tap the link back in.
- [ ] Confirm the share card pastes cleanly in WhatsApp (emoji grid intact, link tappable, no spoilers).
- [ ] Set every game's content file and validate the build passes (zod content check).
- [ ] Confirm Paris-time unlock: today's game open, tomorrow's locked, yesterday's catchable.
- [ ] Load the leaderboard while signed out (it should be visible).
- [ ] Pin a WhatsApp message: the app link, "check spam / mark not spam," and the event code.

## During the week

- Each morning, confirm the day's game unlocked (a quick phone check).
- Drop the daily nudge + link in WhatsApp (manual — no notification system by design).
- If email gets flaky for anyone, point them at the name-pick fallback. No fix needed mid-week.

## After the wedding

- Export the final `game_results` and leaderboard if you want a keepsake.
- Take the app down (delete the Vercel deployment / pause the Supabase project). Private and short-lived by design.
