-- Wedding Games — initial schema.
-- Two tables only: pre-loaded guests, and one result row per guest per game.
-- Everything else (leaderboard, daily winners, streaks) is derived at read time.

-- ── guests ────────────────────────────────────────────────────────────────
-- Pre-loaded from the known list. Powers both the OTP email-match and the
-- name-pick fallback. See docs/DECISIONS.md #2, #4.
create table if not exists guests (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  display_name     text not null,
  preferred_locale text check (preferred_locale in ('en', 'fr')),
  created_at       timestamptz not null default now()
);

-- ── game_results ──────────────────────────────────────────────────────────
-- One row per (guest, game). Replaying updates the row, never duplicates.
create table if not exists game_results (
  id           uuid primary key default gen_random_uuid(),
  guest_id     uuid not null references guests(id) on delete cascade,
  game_id      text not null check (
                 game_id in ('wordle','trivia','two-truths','travel','connections')
               ),
  correctness  real not null check (correctness between 0 and 1),
  score        integer not null check (score between 0 and 1000),
  elapsed_ms   integer not null check (elapsed_ms >= 0),
  detail       jsonb not null default '{}'::jsonb,  -- per-game bits for the share card
  created_at   timestamptz not null default now(),
  unique (guest_id, game_id)
);

create index if not exists game_results_game_idx on game_results (game_id);

-- ── leaderboard view ──────────────────────────────────────────────────────
-- Single source of truth for the live board and the reception reveal.
-- Final ordering / tiebreakers applied in app code (see src/lib/scoring/score.ts).
create or replace view leaderboard as
select
  g.id            as guest_id,
  g.display_name,
  coalesce(sum(r.score), 0)            as total,
  count(r.id)                          as games_played,
  coalesce(sum(r.elapsed_ms), 0)       as total_elapsed_ms,
  g.created_at                         as first_seen,
  count(r.id) = 5                      as streak
from guests g
left join game_results r on r.guest_id = g.id
group by g.id, g.display_name, g.created_at;

-- ── Row-Level Security ─────────────────────────────────────────────────────
-- Guests write only their own results; leaderboard reads are open (first names
-- + scores, not sensitive). Private, friends-only app — see docs/ARCHITECTURE.md.
alter table game_results enable row level security;

create policy "read all results" on game_results
  for select using (true);

create policy "write own results" on game_results
  for insert with check (auth.jwt() ->> 'email' = (
    select email from guests where id = guest_id
  ));

create policy "update own results" on game_results
  for update using (auth.jwt() ->> 'email' = (
    select email from guests where id = guest_id
  ));
