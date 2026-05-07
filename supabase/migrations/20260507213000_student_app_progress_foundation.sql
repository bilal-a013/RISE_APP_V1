-- Layer 4: shared student app progress/activity foundation.
-- This migration is intentionally additive and keeps direct anon table access closed.
-- RISE APP writes through narrow RPCs using its signed Tutor Key student session.

create table if not exists public.student_app_activity (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  activity_type text not null,
  title text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  subject text,
  topic text,
  skill text,
  status text,
  confidence_level text,
  score numeric,
  attempts integer not null default 0,
  last_practised_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint student_progress_score_non_negative check (score is null or score >= 0),
  constraint student_progress_attempts_non_negative check (attempts >= 0)
);

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  lesson_id uuid,
  subject text,
  topic text,
  activity_title text,
  score numeric,
  total_questions integer,
  correct_answers integer,
  time_spent_seconds integer,
  weak_areas text[] not null default '{}'::text[],
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint lesson_attempts_score_non_negative check (score is null or score >= 0),
  constraint lesson_attempts_total_questions_non_negative check (total_questions is null or total_questions >= 0),
  constraint lesson_attempts_correct_answers_non_negative check (correct_answers is null or correct_answers >= 0),
  constraint lesson_attempts_time_spent_non_negative check (time_spent_seconds is null or time_spent_seconds >= 0)
);

create index if not exists student_app_activity_child_created_idx
  on public.student_app_activity(child_profile_id, created_at desc);
create index if not exists student_app_activity_type_created_idx
  on public.student_app_activity(activity_type, created_at desc);
create index if not exists student_progress_child_updated_idx
  on public.student_progress(child_profile_id, updated_at desc);
create index if not exists student_progress_child_topic_idx
  on public.student_progress(child_profile_id, lower(coalesce(subject, '')), lower(coalesce(topic, '')), lower(coalesce(skill, '')));
create index if not exists lesson_attempts_child_completed_idx
  on public.lesson_attempts(child_profile_id, completed_at desc);
create index if not exists lesson_attempts_child_topic_idx
  on public.lesson_attempts(child_profile_id, lower(coalesce(subject, '')), lower(coalesce(topic, '')));

alter table public.student_app_activity enable row level security;
alter table public.student_progress enable row level security;
alter table public.lesson_attempts enable row level security;

revoke all on table public.student_app_activity from anon;
revoke all on table public.student_progress from anon;
revoke all on table public.lesson_attempts from anon;
revoke all on table public.student_app_activity from authenticated;
revoke all on table public.student_progress from authenticated;
revoke all on table public.lesson_attempts from authenticated;

grant select on table public.student_app_activity to authenticated;
grant select on table public.student_progress to authenticated;
grant select on table public.lesson_attempts to authenticated;

drop policy if exists "Tutors can read app activity for their child profiles" on public.student_app_activity;
create policy "Tutors can read app activity for their child profiles"
  on public.student_app_activity
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.child_profiles cp
      where cp.id = student_app_activity.child_profile_id
        and cp.tutor_id = auth.uid()
    )
  );

drop policy if exists "Tutors can read app progress for their child profiles" on public.student_progress;
create policy "Tutors can read app progress for their child profiles"
  on public.student_progress
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.child_profiles cp
      where cp.id = student_progress.child_profile_id
        and cp.tutor_id = auth.uid()
    )
  );

drop policy if exists "Tutors can read lesson attempts for their child profiles" on public.lesson_attempts;
create policy "Tutors can read lesson attempts for their child profiles"
  on public.lesson_attempts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.child_profiles cp
      where cp.id = lesson_attempts.child_profile_id
        and cp.tutor_id = auth.uid()
    )
  );

drop trigger if exists set_student_progress_updated_at on public.student_progress;
create trigger set_student_progress_updated_at
  before update on public.student_progress
  for each row execute function public.set_updated_at();

create or replace function public.record_student_app_activity(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid,
  input_activity_type text,
  input_title text default null,
  input_description text default null,
  input_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_type text := lower(trim(coalesce(input_activity_type, '')));
  v_metadata jsonb := coalesce(input_metadata, '{}'::jsonb);
  v_activity jsonb;
begin
  if v_activity_type = '' then
    raise exception 'activity_type is required';
  end if;

  if v_activity_type not in (
    'app_opened',
    'home_viewed',
    'homework_viewed',
    'practice_started',
    'practice_completed',
    'lesson_started',
    'lesson_completed',
    'quiz_completed'
  ) then
    raise exception 'unsupported activity_type';
  end if;

  if jsonb_typeof(v_metadata) is distinct from 'object' then
    v_metadata := '{}'::jsonb;
  end if;

  if not exists (
    select 1
    from public.tutor_keys tk
    join public.child_profiles cp on cp.id = tk.child_profile_id
    where tk.id = lookup_tutor_key_id
      and tk.child_profile_id = lookup_child_profile_id
      and tk.status = 'active'
      and cp.active is not false
  ) then
    raise exception 'invalid student session';
  end if;

  insert into public.student_app_activity (
    child_profile_id,
    activity_type,
    title,
    description,
    metadata
  )
  values (
    lookup_child_profile_id,
    v_activity_type,
    nullif(left(trim(coalesce(input_title, '')), 160), ''),
    nullif(left(trim(coalesce(input_description, '')), 500), ''),
    v_metadata
  )
  returning jsonb_build_object(
    'id', id,
    'child_profile_id', child_profile_id,
    'activity_type', activity_type,
    'title', title,
    'description', description,
    'metadata', metadata,
    'created_at', created_at
  ) into v_activity;

  return v_activity;
end;
$$;

create or replace function public.get_student_app_activity(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid,
  input_limit integer default 6
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := greatest(1, least(coalesce(input_limit, 6), 20));
  v_activities jsonb;
begin
  if not exists (
    select 1
    from public.tutor_keys tk
    join public.child_profiles cp on cp.id = tk.child_profile_id
    where tk.id = lookup_tutor_key_id
      and tk.child_profile_id = lookup_child_profile_id
      and tk.status = 'active'
      and cp.active is not false
  ) then
    raise exception 'invalid student session';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'activity_type', a.activity_type,
        'title', a.title,
        'description', a.description,
        'metadata', a.metadata,
        'created_at', a.created_at
      ) order by a.created_at desc
    ),
    '[]'::jsonb
  )
  into v_activities
  from (
    select id, activity_type, title, description, metadata, created_at
    from public.student_app_activity
    where child_profile_id = lookup_child_profile_id
    order by created_at desc
    limit v_limit
  ) a;

  return v_activities;
end;
$$;

create or replace function public.upsert_student_progress(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid,
  input_subject text,
  input_topic text,
  input_skill text default null,
  input_status text default null,
  input_confidence_level text default null,
  input_score numeric default null,
  input_attempts_increment integer default 1,
  input_last_practised_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subject text := nullif(left(trim(coalesce(input_subject, '')), 120), '');
  v_topic text := nullif(left(trim(coalesce(input_topic, '')), 160), '');
  v_skill text := nullif(left(trim(coalesce(input_skill, '')), 160), '');
  v_progress jsonb;
begin
  if v_subject is null or v_topic is null then
    raise exception 'subject and topic are required';
  end if;

  if input_score is not null and input_score < 0 then
    raise exception 'score must be non-negative';
  end if;

  if not exists (
    select 1
    from public.tutor_keys tk
    join public.child_profiles cp on cp.id = tk.child_profile_id
    where tk.id = lookup_tutor_key_id
      and tk.child_profile_id = lookup_child_profile_id
      and tk.status = 'active'
      and cp.active is not false
  ) then
    raise exception 'invalid student session';
  end if;

  update public.student_progress
  set
    status = coalesce(nullif(left(trim(coalesce(input_status, '')), 80), ''), status),
    confidence_level = coalesce(nullif(left(trim(coalesce(input_confidence_level, '')), 80), ''), confidence_level),
    score = coalesce(input_score, score),
    attempts = attempts + greatest(coalesce(input_attempts_increment, 0), 0),
    last_practised_at = coalesce(input_last_practised_at, last_practised_at, now()),
    updated_at = now()
  where child_profile_id = lookup_child_profile_id
    and lower(coalesce(subject, '')) = lower(coalesce(v_subject, ''))
    and lower(coalesce(topic, '')) = lower(coalesce(v_topic, ''))
    and lower(coalesce(skill, '')) = lower(coalesce(v_skill, ''))
  returning jsonb_build_object(
    'id', id,
    'child_profile_id', child_profile_id,
    'subject', subject,
    'topic', topic,
    'skill', skill,
    'status', status,
    'confidence_level', confidence_level,
    'score', score,
    'attempts', attempts,
    'last_practised_at', last_practised_at,
    'updated_at', updated_at,
    'created_at', created_at
  ) into v_progress;

  if v_progress is null then
    insert into public.student_progress (
      child_profile_id,
      subject,
      topic,
      skill,
      status,
      confidence_level,
      score,
      attempts,
      last_practised_at
    )
    values (
      lookup_child_profile_id,
      v_subject,
      v_topic,
      v_skill,
      nullif(left(trim(coalesce(input_status, '')), 80), ''),
      nullif(left(trim(coalesce(input_confidence_level, '')), 80), ''),
      input_score,
      greatest(coalesce(input_attempts_increment, 0), 0),
      coalesce(input_last_practised_at, now())
    )
    returning jsonb_build_object(
      'id', id,
      'child_profile_id', child_profile_id,
      'subject', subject,
      'topic', topic,
      'skill', skill,
      'status', status,
      'confidence_level', confidence_level,
      'score', score,
      'attempts', attempts,
      'last_practised_at', last_practised_at,
      'updated_at', updated_at,
      'created_at', created_at
    ) into v_progress;
  end if;

  return v_progress;
end;
$$;

create or replace function public.record_lesson_attempt(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid,
  input_lesson_id uuid default null,
  input_subject text default null,
  input_topic text default null,
  input_activity_title text default null,
  input_score numeric default null,
  input_total_questions integer default null,
  input_correct_answers integer default null,
  input_time_spent_seconds integer default null,
  input_weak_areas text[] default '{}'::text[],
  input_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_metadata jsonb := coalesce(input_metadata, '{}'::jsonb);
  v_attempt jsonb;
begin
  if input_score is not null and input_score < 0 then
    raise exception 'score must be non-negative';
  end if;

  if input_total_questions is not null and input_total_questions < 0 then
    raise exception 'total_questions must be non-negative';
  end if;

  if input_correct_answers is not null and input_correct_answers < 0 then
    raise exception 'correct_answers must be non-negative';
  end if;

  if input_time_spent_seconds is not null and input_time_spent_seconds < 0 then
    raise exception 'time_spent_seconds must be non-negative';
  end if;

  if jsonb_typeof(v_metadata) is distinct from 'object' then
    v_metadata := '{}'::jsonb;
  end if;

  if not exists (
    select 1
    from public.tutor_keys tk
    join public.child_profiles cp on cp.id = tk.child_profile_id
    where tk.id = lookup_tutor_key_id
      and tk.child_profile_id = lookup_child_profile_id
      and tk.status = 'active'
      and cp.active is not false
  ) then
    raise exception 'invalid student session';
  end if;

  insert into public.lesson_attempts (
    child_profile_id,
    lesson_id,
    subject,
    topic,
    activity_title,
    score,
    total_questions,
    correct_answers,
    time_spent_seconds,
    weak_areas,
    metadata
  )
  values (
    lookup_child_profile_id,
    input_lesson_id,
    nullif(left(trim(coalesce(input_subject, '')), 120), ''),
    nullif(left(trim(coalesce(input_topic, '')), 160), ''),
    nullif(left(trim(coalesce(input_activity_title, '')), 180), ''),
    input_score,
    input_total_questions,
    input_correct_answers,
    input_time_spent_seconds,
    coalesce(input_weak_areas, '{}'::text[]),
    v_metadata
  )
  returning jsonb_build_object(
    'id', id,
    'child_profile_id', child_profile_id,
    'lesson_id', lesson_id,
    'subject', subject,
    'topic', topic,
    'activity_title', activity_title,
    'score', score,
    'total_questions', total_questions,
    'correct_answers', correct_answers,
    'time_spent_seconds', time_spent_seconds,
    'weak_areas', weak_areas,
    'completed_at', completed_at,
    'metadata', metadata
  ) into v_attempt;

  return v_attempt;
end;
$$;

revoke execute on function public.record_student_app_activity(uuid, uuid, text, text, text, jsonb) from public;
revoke execute on function public.get_student_app_activity(uuid, uuid, integer) from public;
revoke execute on function public.upsert_student_progress(uuid, uuid, text, text, text, text, text, numeric, integer, timestamptz) from public;
revoke execute on function public.record_lesson_attempt(uuid, uuid, uuid, text, text, text, numeric, integer, integer, integer, text[], jsonb) from public;

grant execute on function public.record_student_app_activity(uuid, uuid, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.get_student_app_activity(uuid, uuid, integer) to anon, authenticated;
grant execute on function public.upsert_student_progress(uuid, uuid, text, text, text, text, text, numeric, integer, timestamptz) to anon, authenticated;
grant execute on function public.record_lesson_attempt(uuid, uuid, uuid, text, text, text, numeric, integer, integer, integer, text[], jsonb) to anon, authenticated;
