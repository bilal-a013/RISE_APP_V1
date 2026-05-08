-- Layer 5: minimal student homework interaction flow.
-- RISE APP reads and updates homework through narrow Tutor Key session RPCs.

create table if not exists public.homework_tasks (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  title text not null,
  instructions text,
  status text not null default 'not_started',
  student_note text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homework_tasks_status_check check (
    status in ('not_started', 'in_progress', 'completed', 'need_help')
  )
);

create index if not exists homework_tasks_child_updated_idx
  on public.homework_tasks(child_profile_id, updated_at desc);

alter table public.homework_tasks enable row level security;

revoke all on table public.homework_tasks from anon;
revoke all on table public.homework_tasks from authenticated;
grant select on table public.homework_tasks to authenticated;

drop policy if exists "Tutors can read homework for their child profiles" on public.homework_tasks;
create policy "Tutors can read homework for their child profiles"
  on public.homework_tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.child_profiles cp
      where cp.id = homework_tasks.child_profile_id
        and cp.tutor_id = (select auth.uid())
    )
  );

drop trigger if exists set_homework_tasks_updated_at on public.homework_tasks;
create trigger set_homework_tasks_updated_at
  before update on public.homework_tasks
  for each row execute function public.set_updated_at();

create or replace function public.get_student_homework_task(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_homework jsonb;
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

  select jsonb_build_object(
    'id', h.id,
    'child_profile_id', h.child_profile_id,
    'title', h.title,
    'instructions', h.instructions,
    'status', h.status,
    'student_note', h.student_note,
    'due_date', h.due_date,
    'completed_at', h.completed_at,
    'created_at', h.created_at,
    'updated_at', h.updated_at
  )
  into v_homework
  from public.homework_tasks h
  where h.child_profile_id = lookup_child_profile_id
  order by
    case when h.status = 'completed' then 1 else 0 end,
    h.updated_at desc,
    h.created_at desc
  limit 1;

  return v_homework;
end;
$$;

create or replace function public.update_student_homework_status(
  lookup_child_profile_id uuid,
  lookup_tutor_key_id uuid,
  input_homework_task_id uuid,
  input_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(input_status, '')));
  v_activity_type text;
  v_homework jsonb;
begin
  if v_status not in ('in_progress', 'completed', 'need_help') then
    raise exception 'unsupported homework status';
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

  update public.homework_tasks h
  set
    status = v_status,
    completed_at = case when v_status = 'completed' then coalesce(h.completed_at, now()) else null end,
    updated_at = now()
  where h.id = input_homework_task_id
    and h.child_profile_id = lookup_child_profile_id
  returning jsonb_build_object(
    'id', h.id,
    'child_profile_id', h.child_profile_id,
    'title', h.title,
    'instructions', h.instructions,
    'status', h.status,
    'student_note', h.student_note,
    'due_date', h.due_date,
    'completed_at', h.completed_at,
    'created_at', h.created_at,
    'updated_at', h.updated_at
  )
  into v_homework;

  if v_homework is null then
    raise exception 'homework task not found';
  end if;

  v_activity_type := case v_status
    when 'in_progress' then 'homework_started'
    when 'completed' then 'homework_completed'
    when 'need_help' then 'homework_help_needed'
  end;

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
    case v_status
      when 'in_progress' then 'Homework started'
      when 'completed' then 'Homework completed'
      when 'need_help' then 'Homework help requested'
    end,
    v_homework ->> 'title',
    jsonb_build_object(
      'source', 'rise_app',
      'route', '/home',
      'homework_task_id', input_homework_task_id,
      'status', v_status
    )
  );

  return v_homework;
end;
$$;

revoke execute on function public.get_student_homework_task(uuid, uuid) from public;
revoke execute on function public.update_student_homework_status(uuid, uuid, uuid, text) from public;

grant execute on function public.get_student_homework_task(uuid, uuid) to anon, authenticated;
grant execute on function public.update_student_homework_status(uuid, uuid, uuid, text) to anon, authenticated;
