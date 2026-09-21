-- Grade Ladder – Supabase project "GradeGauge" (toobdmavmdhigvsmvotj, eu-central-1)
-- Reverse-engineered from the live database on 21 Sep 2026.

-- 1. Existing table (already in the database; shown for reference)
-- create table public.grade_boundaries (
--   id            bigint primary key,
--   board         text,      -- 'AQA' | 'Edexcel'
--   qualification text,      -- 'GCSE'
--   series        text,      -- 'June 2025', 'November 2024', ...
--   subject       text,
--   component     text,      -- 'Whole subject (total)' or a paper/unit name
--   code          text,
--   tier          text,      -- 'Higher' | 'Foundation' | '—' (untiered)
--   max_mark      integer,
--   boundaries    text       -- JSON object, e.g. {"9":219,"8":191,...}
-- );
-- alter table public.grade_boundaries enable row level security;
-- create policy "Public read access" on public.grade_boundaries for select using (true);
-- create index gb_filter_idx on public.grade_boundaries (board, qualification, series, subject);

-- 2. Applied on 21 Sep 2026 (migration: add_series_catalog_and_trend_index)
create or replace view public.gb_series
with (security_invoker = true) as
select board, qualification, series, count(*)::int as records
from public.grade_boundaries
group by board, qualification, series;

grant select on public.gb_series to anon, authenticated;

create index if not exists gb_trend_idx
  on public.grade_boundaries (board, qualification, subject, tier, component);

-- 3. Optional hardening (NOT applied). RLS already blocks writes because the only
--    policy is SELECT, but these remove the default write grants as a second layer.
-- revoke insert, update, delete, truncate on public.grade_boundaries from anon, authenticated;

-- Adding a new board or qualification needs no schema or code change:
-- insert rows with the same columns and the site picks them up automatically.
