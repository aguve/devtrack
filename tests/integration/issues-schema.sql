begin;

do $$
declare
  owner_id uuid := gen_random_uuid();
  issue public.issues%rowtype;
  saved_created_at timestamptz;
  saved_updated_at timestamptz;
begin
  insert into auth.users (id, email)
  values (owner_id, owner_id || '@devtrack.example');

  insert into public.issues (user_id, title) values (owner_id, 'First issue')
  returning * into issue;

  if issue.id is null or pg_typeof(issue.id) <> 'uuid'::regtype
    or pg_typeof(issue.created_at) <> 'timestamp with time zone'::regtype
    or pg_typeof(issue.updated_at) <> 'timestamp with time zone'::regtype
    or issue.created_at is null or issue.updated_at is null
    or issue.status is distinct from 'todo'
    or issue.priority is distinct from 'medium'
    or issue.description is not null
  then
    raise exception 'Issue UUID, timestamp types, or defaults are incorrect';
  end if;

  begin
    insert into public.issues (id, user_id, title) values (issue.id, owner_id, 'Duplicate');
    raise exception 'Duplicate issue UUID accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.issues (user_id, title) values (gen_random_uuid(), 'Missing owner');
    raise exception 'Unknown owner accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.issues (title) values ('Missing owner');
    raise exception 'Missing owner accepted';
  exception when not_null_violation then null;
  end;

  begin
    insert into public.issues (user_id) values (owner_id);
    raise exception 'Missing title accepted';
  exception when not_null_violation then null;
  end;

  begin
    insert into public.issues (user_id, title) values (owner_id, E' \t');
    raise exception 'Whitespace-only title accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.issues (user_id, title) values (owner_id, repeat('x', 121));
    raise exception 'Over-limit title accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.issues (user_id, title, description)
    values (owner_id, 'Long description', repeat('x', 4001));
    raise exception 'Over-limit description accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.issues (user_id, title, status)
    values (owner_id, 'Invalid status', 'archived');
    raise exception 'Invalid status accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.issues (user_id, title, priority)
    values (owner_id, 'Invalid priority', 'urgent');
    raise exception 'Invalid priority accepted';
  exception when check_violation then null;
  end;

  saved_created_at := issue.created_at;
  saved_updated_at := issue.updated_at;

  update public.issues set
    title = repeat('x', 120),
    description = repeat('x', 4000),
    status = 'in_progress',
    priority = 'high',
    created_at = '2000-01-01',
    updated_at = '2000-01-01'
  where id = issue.id
  returning * into issue;

  if not found or issue.created_at is distinct from saved_created_at
    or issue.updated_at is null or issue.updated_at <= saved_updated_at
    or char_length(issue.title) <> 120 or char_length(issue.description) <> 4000
    or issue.status is distinct from 'in_progress'
    or issue.priority is distinct from 'high'
  then
    raise exception 'Issue update or timestamp preservation is incorrect';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_index as idx
    join pg_catalog.pg_attribute as owner_column
      on owner_column.attrelid = idx.indrelid and owner_column.attnum = idx.indkey[0]
    where idx.indrelid = 'public.issues'::regclass
      and idx.indisvalid and idx.indisready and idx.indpred is null
      and owner_column.attname = 'user_id'
  ) then
    raise exception 'Missing valid owner-leading issues index';
  end if;

  delete from auth.users where id = owner_id;
  if exists (select 1 from public.issues where user_id = owner_id) then
    raise exception 'Auth user deletion did not cascade to issues';
  end if;
end;
$$;

rollback;
select 'DevTrack issues schema checks passed';
