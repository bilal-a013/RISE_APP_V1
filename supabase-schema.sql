create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'tutor',
  created_at timestamp with time zone default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  age int,
  year_group text,
  pronouns text,
  school text,
  subjects text[] default '{}',
  exam_board text,
  current_grade text,
  target_grade text,
  goals text,
  strengths text[] default '{}',
  struggles text[] default '{}',
  parent_name text,
  parent_email text,
  parent_phone text,
  tutor_key text unique not null,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  subject text,
  topic text,
  summary text,
  strengths text[] default '{}',
  struggles text[] default '{}',
  homework text,
  next_steps text,
  created_at timestamp with time zone default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  title text not null,
  body text,
  sent_status text default 'draft',
  sent_to text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists parent_replies (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  report_id uuid references reports(id) on delete set null,
  parent_email text,
  subject text,
  body text,
  received_at timestamp with time zone default now(),
  gmail_thread_id text
);

alter table profiles enable row level security;
alter table students enable row level security;
alter table sessions enable row level security;
alter table reports enable row level security;
alter table parent_replies enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
on profiles for select
using (id = auth.uid());

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
on profiles for insert
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Tutors can read own students" on students;
create policy "Tutors can read own students"
on students for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own students" on students;
create policy "Tutors can insert own students"
on students for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own students" on students;
create policy "Tutors can update own students"
on students for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own students" on students;
create policy "Tutors can delete own students"
on students for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own sessions" on sessions;
create policy "Tutors can read own sessions"
on sessions for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own sessions" on sessions;
create policy "Tutors can insert own sessions"
on sessions for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own sessions" on sessions;
create policy "Tutors can update own sessions"
on sessions for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can delete own sessions" on sessions;
create policy "Tutors can delete own sessions"
on sessions for delete
using (tutor_id = auth.uid());

drop policy if exists "Tutors can read own reports" on reports;
create policy "Tutors can read own reports"
on reports for select
using (tutor_id = auth.uid());

drop policy if exists "Tutors can insert own reports" on reports;
create policy "Tutors can insert own reports"
on reports for insert
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can update own reports" on reports;
create policy "Tutors can update own reports"
on reports for update
using (tutor_id = auth.uid())
with check (tutor_id = auth.uid());

drop policy if exists "Tutors can read own parent replies" on parent_replies;
create policy "Tutors can read own parent replies"
on parent_replies for select
using (
  exists (
    select 1
    from students
    where students.id = parent_replies.student_id
      and students.tutor_id = auth.uid()
  )
);

create index if not exists students_tutor_id_idx on students(tutor_id);
create index if not exists sessions_tutor_id_idx on sessions(tutor_id);
create index if not exists sessions_student_id_idx on sessions(student_id);
create index if not exists reports_tutor_id_idx on reports(tutor_id);
create index if not exists reports_student_id_idx on reports(student_id);
