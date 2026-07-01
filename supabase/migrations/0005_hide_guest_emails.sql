-- 0005: stop exposing guest emails (and RSVP/side) to the public.
--
-- The "read guests" policy is deliberately open (the name-pick roster needs
-- it), but it was open on every column — with the anon key shipped in the JS
-- bundle, anyone with the URL could list the wedding roster's emails. Column
-- privileges fix that without touching the policy: the app only ever selects
-- id / display_name / first_name (+ auth_user_id to find "me", created_at for
-- the leaderboard view, preferred_locale for future default-language use).
--
-- The seed script uses the service role, which keeps full access.

revoke select on table guests from anon, authenticated;
grant select (id, display_name, first_name, preferred_locale, auth_user_id, created_at)
  on table guests to anon, authenticated;
