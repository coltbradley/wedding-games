-- 0002: link Supabase auth users to pre-loaded guests, and enforce score ownership.
-- Applies on top of 0001. See docs/DECISIONS.md #2/#4 for the sign-in model.

-- Each guest can be bound to one auth user (the device/person who signed in as them).
alter table guests add column if not exists auth_user_id uuid references auth.users(id);
create unique index if not exists guests_auth_user_idx on guests (auth_user_id) where auth_user_id is not null;

-- Roster + names are readable without auth: needed to greet by name and to power
-- the name-pick fallback. Emails are not sensitive for this private, friends-only app.
alter table guests enable row level security;
drop policy if exists "read guests" on guests;
create policy "read guests" on guests for select using (true);

-- Security-definer linker: bind the current auth user to a guest.
--   p_guest_id null  => OTP path: match by the auth user's verified email.
--   p_guest_id given => name-pick fallback: bind to the chosen guest.
-- Refuses if the guest is already bound to a different auth user.
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
  if g.auth_user_id is not null and g.auth_user_id <> auth.uid() then
    raise exception 'guest_already_claimed';
  end if;

  update guests set auth_user_id = auth.uid() where id = g.id returning * into g;
  return g;
end;
$$;

-- Score ownership: a guest may only write rows for themselves (their bound auth user).
drop policy if exists "write own results" on game_results;
drop policy if exists "update own results" on game_results;

create policy "insert own results" on game_results for insert
  with check (exists (select 1 from guests gx where gx.id = guest_id and gx.auth_user_id = auth.uid()));

create policy "update own results" on game_results for update
  using (exists (select 1 from guests gx where gx.id = guest_id and gx.auth_user_id = auth.uid()));

-- Leaderboard read stays public (first names + scores only). Policy from 0001 still applies.
