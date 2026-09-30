-- Run once in the project SQL Editor. No public client may grant editor access.
begin;
create table public.site_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_editors enable row level security;
revoke all on public.site_editors from anon, authenticated;
grant select on public.site_editors to authenticated;
create policy "Editors can check their own membership" on public.site_editors
for select to authenticated using (user_id = (select auth.uid()));

create table public.site_content (
  slug text primary key check (slug = 'main'),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) < 131072),
  revision integer not null default 0 check (revision >= 0)
);
insert into public.site_content (slug) values ('main');
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant update(content, revision) on public.site_content to authenticated;
create policy "Published text is public" on public.site_content
for select to anon, authenticated using (slug = 'main');
create policy "Invited editors can update text" on public.site_content
for update to authenticated
using (exists (select 1 from public.site_editors where user_id = (select auth.uid())))
with check (slug = 'main' and exists (select 1 from public.site_editors where user_id = (select auth.uid())));
create function public.check_content_revision() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.revision <> old.revision + 1 then
    raise exception 'Revision must advance by one';
  end if;
  return new;
end;
$$;
create trigger check_revision before update on public.site_content
for each row execute function public.check_content_revision();
commit;
-- After inviting each user through Authentication > Users, grant by verified user UUID:
-- insert into public.site_editors(user_id) values ('USER_UUID');
-- Revoke access: delete from public.site_editors where user_id = 'USER_UUID';
