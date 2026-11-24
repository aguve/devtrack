begin;

grant select, insert, update, delete on public.issues to authenticated;

create policy issues_select_own
  on public.issues
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy issues_insert_own
  on public.issues
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy issues_update_own
  on public.issues
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy issues_delete_own
  on public.issues
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
