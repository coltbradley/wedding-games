-- 0003: clear the security advisors from 0001/0002.
-- Nothing behavioural changes; this only tightens who runs what.

-- The leaderboard view should run with the *querying* user's permissions, not the
-- view owner's. Both underlying tables already have public SELECT policies, so the
-- board stays open (first names + scores) while no longer bypassing RLS.
alter view leaderboard set (security_invoker = on);

-- link_me is only ever called after an anonymous sign-in (role = authenticated),
-- never by the unauthenticated `anon` role. Lock it down to match.
revoke execute on function link_me(uuid) from anon, public;
grant execute on function link_me(uuid) to authenticated;
