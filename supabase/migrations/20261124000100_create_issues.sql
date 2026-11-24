begin;

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint issues_title_valid check (
    char_length(title) between 1 and 120 and title ~ '[^[:space:]]'
  ),
  constraint issues_description_length check (char_length(description) <= 4000),
  constraint issues_status_valid check (status in ('todo', 'in_progress', 'done')),
  constraint issues_priority_valid check (priority in ('low', 'medium', 'high'))
);

create index issues_owner_updated_idx
  on public.issues (user_id, updated_at desc, id);

create function public.set_issue_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger issues_set_timestamps
  before update on public.issues
  for each row execute function public.set_issue_timestamps();

alter table public.issues enable row level security;

-- Supabase projects can have default grants on public tables and functions.
revoke all on public.issues from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.issues to service_role;
revoke all on function public.set_issue_timestamps()
  from public, anon, authenticated, service_role;

commit;
