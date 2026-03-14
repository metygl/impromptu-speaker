create extension if not exists pgcrypto;

create table if not exists public.speech_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  topic_text text not null,
  framework_id text,
  framework_name text not null,
  transcript text not null,
  analysis_json jsonb not null,
  overall_score integer,
  transcript_char_count integer not null default 0,
  prompt_version text
);

create table if not exists public.analysis_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  feedback_id uuid references public.speech_feedback (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('reserved', 'succeeded', 'failed_before_model', 'failed_after_model')),
  transcript_char_count integer not null default 0,
  model_name text,
  error_code text
);

create index if not exists speech_feedback_user_created_at_idx
  on public.speech_feedback (user_id, created_at desc);

create index if not exists analysis_attempts_user_created_at_idx
  on public.analysis_attempts (user_id, created_at desc);

alter table public.speech_feedback enable row level security;
alter table public.analysis_attempts enable row level security;

create policy "speech_feedback_select_own"
  on public.speech_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "speech_feedback_insert_own"
  on public.speech_feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "analysis_attempts_select_own"
  on public.analysis_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "analysis_attempts_insert_own"
  on public.analysis_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "analysis_attempts_update_own"
  on public.analysis_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.reserve_analysis_attempt(
  p_daily_limit integer,
  p_transcript_char_count integer
)
returns table (attempt_id uuid, remaining_today integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  consumed_today integer;
  new_attempt_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select count(*)
    into consumed_today
  from public.analysis_attempts
  where user_id = current_user_id
    and created_at >= date_trunc('day', timezone('utc', now()))
    and status in ('reserved', 'succeeded', 'failed_after_model');

  if consumed_today >= p_daily_limit then
    return;
  end if;

  insert into public.analysis_attempts (
    user_id,
    status,
    transcript_char_count
  )
  values (
    current_user_id,
    'reserved',
    p_transcript_char_count
  )
  returning id into new_attempt_id;

  return query
  select
    new_attempt_id,
    greatest(p_daily_limit - (consumed_today + 1), 0);
end;
$$;

revoke all on function public.reserve_analysis_attempt(integer, integer) from public;
grant execute on function public.reserve_analysis_attempt(integer, integer) to authenticated;
