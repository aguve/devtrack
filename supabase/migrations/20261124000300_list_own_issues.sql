begin;

create function public.list_own_issues(
  search_term text default null,
  filter_status text default null,
  filter_priority text default null
)
returns table (
  id uuid,
  title text,
  description text,
  priority text,
  status text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select issue.id, issue.title, issue.description, issue.priority, issue.status, issue.updated_at
  from public.issues as issue
  where issue.user_id = (select auth.uid())
    and (filter_status is null or issue.status = filter_status)
    and (filter_priority is null or issue.priority = filter_priority)
    and (
      search_term is null
      or (
        char_length(search_term) <= 120
        and (
          strpos(lower(issue.title), lower(search_term)) > 0
          or strpos(lower(issue.description), lower(search_term)) > 0
        )
      )
    )
  order by issue.updated_at desc, issue.id asc;
$$;

revoke all on function public.list_own_issues(text, text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.list_own_issues(text, text, text) to authenticated;

commit;
