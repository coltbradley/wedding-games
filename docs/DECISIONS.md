# Decisions

Lightweight ADRs (architecture decision records). Each is a call made during the build, the reasoning, and where it's open. Read top to bottom for the thinking behind the skeleton.

The four goals everything optimizes for: **anticipation**, **near-zero friction to start**, **braggability**, **a public payoff at the reception**.

---

## 1. Stack: Next.js + Vercel + Supabase + PWA

**Decision:** Build exactly as the brief's instinct suggested.

**Why:** It's the right fit, not just the path of least resistance. Vercel gives zero-config deploys and edge speed on phones. Supabase gives Postgres + magic-link auth + row-level security with almost no backend code. A PWA is installable and fast without app-store friction. Everything here is cheap-to-free at our scale (a few dozen guests, one week) and quick to stand up.

**Not chosen:** A custom server, a heavier auth provider (Auth0/Clerk — overkill and more friction), a native app (app-store friction kills the near-zero-start goal).

---

## 2. Sign-in: name-pick + remember-on-device, no email

> **Updated decision (this is what's built).** We went simpler than the email-code plan below. Sign-in is: open the link, tap your name from the roster, confirm, you're in — and the device remembers you, so it's a one-time thing per phone. No email anywhere. A shared guest code is **optional** (`NEXT_PUBLIC_EVENT_CODE`): set it to gate against strangers, leave it unset for the absolute simplest flow.
>
> **Why we dropped email:** Colt's worry was deliverability to French ISPs (orange.fr, free.fr). The honest answer is that email to those providers is the single most fragile link for this exact audience, and no setup makes it 100%. Removing email removes the entire failure mode. Supabase itself works fine in France — only the _email_ was ever the France-specific risk.
>
> **How it's wired:** Supabase **anonymous auth** gives each guest a persistent session (an `auth.uid()` for row-level security and score writes), then the `link_me` security-definer RPC binds that session to their pre-loaded guest row (migration 0002). The session lives in the browser, so returning guests skip sign-in entirely. Trade-off: identity is honor-system (anyone could tap anyone's name), which Colt confirmed is fine; the optional shared code is the only gate, and even that isn't memorized (it's on the invite). Email-code sign-in remains a ~10-minute add-on later (the schema and data layer already support it) — the design below is preserved for that.

The original email-first analysis follows. Decided after research (see sources at the bottom of this doc).

**The deliverability risk is real and confirmed.** Supabase's built-in auth email is capped at ~2 emails/hour total (unusable) and sends from a shared domain that gets spam-filtered. For our exact audience — older relatives on free providers, French ISPs (orange.fr, free.fr) that filter aggressively — those mails land in spam or nowhere.

**Why a code, not a magic link:** a magic link is single-use, and email security scanners and link-trackers (common on ISP/corporate mail) _pre-click_ it before the guest does — so the guest taps it and gets "link expired." A 6-digit code has no such failure mode, keeps the guest _inside the app_ (no mail-app round-trip), and autofills from the email on modern phones. Same identity guarantee, strictly more reliable and lower friction.

**Decision (chosen flow):**

- **Primary — email code (OTP).** One shared app URL for everyone (no per-person links to track). Guest types their email, receives a 6-digit code, types it in. We match the email against the pre-loaded guest list, so each login still maps to a real, named person — no impersonation, no two-Sarahs confusion, clean scoring. Implemented with Supabase `signInWithOtp` and an email template that surfaces `{{ .Token }}` (the code) rather than the link.
- **Fallback — name pick + shared event code.** "Didn't get the code? Find your name →" lands on a searchable roster; guest taps their name and enters one shared event code (printed on the invite / pinned in WhatsApp). Zero email dependency for anyone whose mail fails. Lower identity assurance (honor system), which is fine — Colt confirmed security isn't a concern, reliability is.
- **Deliverability hardening (applies to the OTP email):** custom SMTP (Resend or Postmark) on a dedicated authenticated sending subdomain (e.g. `play.<wedding-domain>`) with SPF + DKIM + DMARC. Keep the email dead simple — clear From name, the code prominent, almost no other content (talking about the app trips marketing/spam classifiers). Don't mix with any marketing send.

**Action before launch:** send test codes to at least one real orange.fr, one free.fr, and one Gmail address belonging to a non-technical relative, and check the spam folder. Pin a WhatsApp note telling guests to check spam and mark "not spam."

---

## 3. Content lives in the repo, not a CMS

**Decision:** Game content (words, questions, categories, bilingual copy) ships as typed, version-controlled data in `src/content/games/`. Validated with a schema (zod) at build time. See `docs/CONTENT-FORMAT.md`.

**Why:** The content is small, static, and authored by two people who hand it over finished. A CMS adds cost, a moving part, and a runtime dependency for zero benefit. Git gives review, history, and rollback for free. The database is only for things that change at runtime: guests and scores.

---

## 4. Identity: pre-loaded guest list, session remembered on the device

**Decision:** The guest list is pre-loaded so every login maps to a real, named person. No passwords. Once signed in (by either path in #2), the device keeps the session, so a guest signs in once and just returns each day.

**Why:** Pre-loading means we greet people by name and attribute scores cleanly. Persisting the session is what makes the daily return near-zero-friction — the whole anticipation loop depends on coming back being effortless. See #2 for the two sign-in paths and the deliverability safety net.

---

## 5. Scoring: normalized per game, speed = play duration not calendar earliness

**Decision:** Every game contributes a comparable normalized score. Speed is rewarded, but "speed" means _how long the play session took_, never _how early in the week you played_. Catch-up players are not punished. Cumulative champion + daily winners + a played-every-day streak badge + a deterministic tiebreaker. Full formula in `docs/SCORING.md`.

**Why:** Directly serves fairness for late joiners (a stated goal) and keeps the reception reveal from being a muddle.

---

## 6. Leaderboard is viewable without a login wall

**Decision:** Anyone in our circle can see the board (today vs all-time) without signing in. Playing requires auth; looking does not.

**Why:** Seeing the board is a primary motivator and the brief explicitly didn't want it buried. The data isn't sensitive (first names + scores). The app stays `noindex` so it's not publicly discoverable.

---

## 7. Sharing: one Wordle-style card per game, generated client-side

**Decision:** Every game — including the quiz-style ones — emits a spoiler-free emoji result card with a link back. Trivia becomes a ✅🟥 grid, Connections its colored-square grid, etc. Copy-to-clipboard in one tap, pastes clean into WhatsApp.

**Why:** This is the growth loop. The restraint is the genius of Wordle's version; we copy the restraint, not just the format. Consistency across games makes the loop a habit.

---

## 8. i18n: FR/EN, instant client toggle, no URL prefix

**Decision:** No i18n framework. One bilingual strings table (`src/lib/strings.ts`) behind a React context with a visible EN/FR toggle. The choice persists to localStorage and defaults from the browser language; `<html lang>` follows it. No `/fr` `/en` URL segment.

> The original plan said `next-intl` with a cookie locale. The app turned out to be a single client-rendered screen tree, so a routing-aware i18n framework bought nothing — the context toggle switches instantly with no reload. Language-sensitive game state (the Wordle answer, the Connections grid) is pinned to the language the game started in so a mid-game toggle can't re-grade a board.

**Why:** No URL prefix keeps shared links clean and avoids confusing guests with locale-in-the-link. Not an SEO product, so we lose nothing by skipping localized routing.

---

## 9. Daily unlock on Paris time, catch-up always allowed

**Decision:** One game unlocks per day keyed to Europe/Paris. Past games stay playable for catch-up; future games are locked (dimmed rows with their open date; the hub features today's game, or a countdown card before launch). Scoring is unaffected by _when_ you play (see #5).

**Why:** Scarcity creates the shared daily ritual (anticipation), while catch-up keeps late arrivals in the game.

> Dev/preview escape hatch: `NEXT_PUBLIC_UNLOCK_ALL=1` opens every game regardless of date, for testing before launch. Never set it in production.

---

## Reads on the brief's three questions

**Magic link / deliverability:** Covered in #2. Short version: use an email _code_ (OTP) not a magic _link_ (links get pre-clicked dead by scanners and force a mail-app round-trip); custom authenticated SMTP to make it land; name-pick + shared event code as the no-email fallback. Test against real French-ISP addresses before launch. Decided with Colt.

**Prize mechanic:** Keep it social in software, physical in the room. Don't build a prize _system_. Crown a cumulative champion + daily winners + a streak badge, and back it with one token physical prize (Burgundy bottle, silly trophy) revealed at the reception. Big payoff, near-zero build.

**Lineup reshape:** Keep the lineup and the familiar→personal order. Two changes worth making: (a) make the **Travel round a swipe interaction** (France ⟷ Sri Lanka) — most mobile-native and braggable; (b) ensure **every** game emits a shareable emoji card, not just Wordle/Connections. One content caveat: **Connections likely needs a separate FR grid and EN grid** — the category wordplay won't translate cleanly. Flagged in `docs/CONTENT-FORMAT.md`.

---

## Out of scope for v1 (by agreement)

Photos / guest album / slideshow (use a dedicated tool). Push notifications (WhatsApp is the channel). Heavy compliance machinery (private, friends-only, taken down after the wedding). The in-person finale Connections (offline, doesn't feed the leaderboard).

---

## Considered for later: live leaderboard via Supabase Realtime

Not building this now, recorded so it isn't rediscovered from scratch.

The leaderboard currently reads on load and on navigation. Supabase Realtime could subscribe to `game_results` and push updates so the board re-ranks live, with no refresh. The one moment it would matter is the reception reveal (goal #4, the public payoff): scores landing on a projected board in real time as the last results come in.

It is a small feature, not a config toggle: enable Realtime on the table, add a client subscription that invalidates or merges the leaderboard query, and confirm RLS still only exposes what the read policy allows. Worth it only if we want the projected reveal to animate itself rather than being refreshed by hand. Decision deferred; default is no.

---

## Sources (sign-in research)

- [Supabase — Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase — Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase — Production checklist (deliverability, DKIM/SPF/DMARC, scanners pre-clicking single-use links)](https://supabase.com/docs/guides/deployment/going-into-prod)
- [OTP vs magic links — passwordless comparison (Scalekit)](https://www.scalekit.com/blog/otp-vs-magic-links-passwordless-authentication)
- [SMS OTP vs magic links vs passkeys: conversion (MojoAuth)](https://mojoauth.com/blog/sms-otp-vs-magic-links-vs-passkeys-ecommerce-conversion)
- [Wedding-app guest access patterns (Appy Couple features)](https://www.appycouple.com/features/)
