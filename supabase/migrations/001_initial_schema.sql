-- ============================================================
-- RISE — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Custom Enum Types ───────────────────────────────────────
create type lesson_type as enum ('learn', 'practise');
create type lesson_tier as enum ('foundation', 'higher');
create type progress_status as enum ('not_started', 'in_progress', 'completed');

-- ============================================================
-- SUBJECTS
-- ============================================================
create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  icon_name    text,
  color        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- TOPICS
-- ============================================================
create table public.topics (
  id           uuid primary key default gen_random_uuid(),
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  name         text not null,
  slug         text not null,
  order_index  integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (subject_id, slug)
);

create index topics_subject_id_idx on public.topics(subject_id);

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id                    uuid primary key default gen_random_uuid(),
  topic_id              uuid not null references public.topics(id) on delete cascade,
  title                 text not null,
  slug                  text not null,
  type                  lesson_type not null,
  tier                  lesson_tier not null,
  order_index           integer not null default 0,
  estimated_minutes     integer not null default 10,
  learning_objectives   text[] not null default '{}',
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  unique (topic_id, slug)
);

create index lessons_topic_id_idx on public.lessons(topic_id);

-- ============================================================
-- PROFILES
-- (Extends auth.users — one row per registered user)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  year_group    text,
  target_grade  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on profile changes
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile row when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LESSON_PROGRESS
-- ============================================================
create table public.lesson_progress (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles(id) on delete cascade,
  lesson_id           uuid not null references public.lessons(id) on delete cascade,
  status              progress_status not null default 'not_started',
  started_at          timestamptz,
  completed_at        timestamptz,
  last_accessed_at    timestamptz,
  time_spent_seconds  integer not null default 0,
  unique (student_id, lesson_id)
);

create index lesson_progress_student_id_idx on public.lesson_progress(student_id);
create index lesson_progress_lesson_id_idx  on public.lesson_progress(lesson_id);

-- ============================================================
-- STUDENT_SESSIONS
-- ============================================================
create table public.student_sessions (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.profiles(id) on delete cascade,
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  opened_at         timestamptz not null default now(),
  closed_at         timestamptz,
  duration_seconds  integer
);

create index student_sessions_student_id_idx on public.student_sessions(student_id);
create index student_sessions_lesson_id_idx  on public.student_sessions(lesson_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.subjects         enable row level security;
alter table public.topics           enable row level security;
alter table public.lessons          enable row level security;
alter table public.profiles         enable row level security;
alter table public.lesson_progress  enable row level security;
alter table public.student_sessions enable row level security;

-- ─── Subjects: readable by all authenticated users ───────────
create policy "Authenticated users can read subjects"
  on public.subjects for select
  to authenticated
  using (is_active = true);

-- ─── Topics: readable by all authenticated users ─────────────
create policy "Authenticated users can read topics"
  on public.topics for select
  to authenticated
  using (is_active = true);

-- ─── Lessons: readable by all authenticated users ────────────
create policy "Authenticated users can read lessons"
  on public.lessons for select
  to authenticated
  using (is_active = true);

-- ─── Profiles: each student manages their own row ────────────
create policy "Students can view their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Students can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─── Lesson Progress: students own their rows ────────────────
create policy "Students can view their own progress"
  on public.lesson_progress for select
  to authenticated
  using (student_id = auth.uid());

create policy "Students can insert their own progress"
  on public.lesson_progress for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "Students can update their own progress"
  on public.lesson_progress for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ─── Student Sessions: students own their rows ───────────────
create policy "Students can view their own sessions"
  on public.student_sessions for select
  to authenticated
  using (student_id = auth.uid());

create policy "Students can insert their own sessions"
  on public.student_sessions for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "Students can update their own sessions"
  on public.student_sessions for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ============================================================
-- SEED — Core Subjects
-- (Also available separately in supabase/seed.sql)
-- ============================================================
insert into public.subjects (name, slug, icon_name, color) values
  ('Maths',       'maths',       'calculator',  '#3B82F6'),
  ('English',     'english',     'book-open',   '#8B5CF6'),
  ('Science',     'science',     'flask',       '#10B981'),
  ('History',     'history',     'landmark',    '#F59E0B'),
  ('Geography',   'geography',   'globe',       '#06B6D4');
