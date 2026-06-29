# Lessons learned

Hard-won gotchas from building and wiring this app. Read before touching auth,
the data layer, the leaderboard, or the deploy. The point is to not relearn
these the slow way.

## Auth and sessions

**Persist the session in localStorage, not cookies.** The app is fully
client-rendered with no server-side auth reads, so it has no need for the
cookie storage that `@supabase/ssr` uses. Worse, iOS Safari caps and evicts
JS-set cookies (ITP), and a home-screen PWA gets isolated storage, so the
session vanished and returning guests landed back on the sign-in screen. The
fix was the plain `@supabase/supabase-js` browser client with
`persistSession` (localStorage), as a cached singleton. localStorage survives
on iOS where the cookie did not. See `src/lib/supabase/client.ts`.

**A stored session can outlive its auth user, so sign-in must self-heal.**
localStorage can hold a session whose anonymous user no longer exists (the
project's anonymous users were wiped, or a future Supabase prune). `getSession`
still returns that stale session, so the sign-in reused it and `link_me` failed
to bind, surfacing as "something went wrong" with no escape. `signInWithName`
now retries once: if `link_me` errors, sign out, mint a fresh anonymous user,
and try again. See `src/lib/data/supabase.ts`.

**Do not wipe `auth.users` while real sessions exist.** Routine test cleanup
that ran `delete from auth.users where is_anonymous = true` orphaned a live
phone session and produced the "something went wrong" above. During cleanup,
clearing `game_results` and unbinding guests is enough; leave the auth users
alone unless you mean to log everyone out. (The self-heal above now recovers
from it, but do not rely on that as a reason to be careless.)

**`link_me` rebinds, it does not reject.** Identity is honor-system for this
private event (see `docs/DECISIONS.md` #2). The original guard raised
`guest_already_claimed` when a guest was bound to a different auth user, which
locked out a returning guest whose device had lost its session. It now rebinds
the guest to whoever signs in. Scores live on `guest_id`, never on the auth
user, so rebinding never loses results. See migration `0004_link_me_rebind`.

## Data layer and verification

**Verify against the database, not the screen.** The app renders the result
card, the "solved" state, and the leaderboard from client state in places, so a
green screen does not prove a write landed. Two real bugs were invisible in the
UI and only showed up by querying Supabase: wordle never persisted its score
(below), and the Today board read 0. When checking a write, query the table.

**Every game must submit its result.** Wordle was the only game with no
submission path. The other four call `finishGame` (which calls
`data.submitResult`) on their Next tap; wordle's solve handler only updated
local state, so its score, the day-1 game, never reached Supabase while the UI
happily showed "Solved." Wordle finishes on the same keypress that adds the
last guess, so it now submits there. See `src/components/app/game.tsx`.

## Leaderboard

**"Today" was the wrong axis.** A "today" board reads 0 for everyone before
the launch date, because no game is unlocked yet, and during the event it
unfairly favours whoever played the most games. The board is now All-time
(cumulative) plus one board per game, each a fair head-to-head on the same
0-1000 scale. See the leaderboard rework commit and `src/components/screens/Leaderboard.tsx`.

## Deploy and tooling

**`NEXT_PUBLIC_*` vars are inlined at build, so a missing key fails silently
into mock mode.** With the Supabase keys absent from the Vercel build, the app
fell back to the mock client: a fake roster (Valentine, Léa, Margaux) and no
persistence, with no error. Setting the vars in Vercel does nothing until you
redeploy. If you see those mock names on the live site, the keys were not in
the build. See `docs/DEPLOYMENT.md`.

**Do not run `npm run build` while `npm run dev` is running.** The production
build overwrites `.next`, and the dev server then throws `Cannot find module
'./99.js'` and serves a stuck loader. Stop the dev server before building, or
build in a separate checkout.
