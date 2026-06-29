-- 0004: let a returning guest reclaim their name.
--
-- The 0002 link_me raised `guest_already_claimed` whenever a guest row was bound
-- to a different auth user. But a device that loses its session (iOS Safari evicts
-- the auth storage, a reinstalled PWA, a cleared browser) comes back as a brand-new
-- anonymous user, so the guest is "already claimed" by an orphaned session and the
-- person can never sign back in as themselves. Identity here is honor-system for a
-- private, friends-only event (see docs/DECISIONS.md #2), so the right behaviour is
-- to rebind the guest to whoever is signing in now. Scores live on guest_id, not on
-- the auth user, so rebinding never loses results.

create or replace function link_me(p_guest_id uuid default null)
returns guests
language plpgsql
security definer
set search_path = public
as $$
declare
  g guests;
begin
  if p_guest_id is null then
    select * into g from guests where lower(email) = lower(auth.jwt() ->> 'email') limit 1;
  else
    select * into g from guests where id = p_guest_id limit 1;
  end if;

  if g.id is null then
    raise exception 'guest_not_found';
  end if;

  -- Rebind to the current session unconditionally (no guest_already_claimed guard).
  update guests set auth_user_id = auth.uid() where id = g.id returning * into g;
  return g;
end;
$$;
