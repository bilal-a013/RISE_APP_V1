-- ============================================================
-- RISE — Seed Data
-- Run after migrations to populate reference data.
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- ============================================================

-- ─── Subjects ─────────────────────────────────────────────────
insert into public.subjects (name, slug, icon_name, color) values
  ('Maths',       'maths',       'calculator',  '#3B82F6'),
  ('English',     'english',     'book-open',   '#8B5CF6'),
  ('Science',     'science',     'flask',       '#10B981'),
  ('History',     'history',     'landmark',    '#F59E0B'),
  ('Geography',   'geography',   'globe',       '#06B6D4')
on conflict (slug) do nothing;
