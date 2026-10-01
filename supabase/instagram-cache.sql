begin;
create table if not exists public.instagram_cache (
 id integer primary key check(id=1),
 feed jsonb not null check(jsonb_typeof(feed->'posts')='array'),
 checked_at timestamptz,
 last_attempt timestamptz not null default '1970-01-01',
 last_error text
);
alter table public.instagram_cache enable row level security;
revoke all on public.instagram_cache from anon, authenticated;
grant select, update on public.instagram_cache to service_role;
grant select(id,feed,checked_at) on public.instagram_cache to anon, authenticated;
create policy "Instagram public feed read" on public.instagram_cache for select to anon, authenticated using(id=1);
insert into public.instagram_cache(id,feed) values(1,$feed${"account": "magiskas.miskas", "posts": [{"id": "3996961478521852714", "permalink": "https://www.instagram.com/reel/Dd4D0m0NxMq/", "timestamp": "2026-09-29T15:15:06.000Z", "caption": "Gamtai mingant - bunda magija! ✨🔮\n\nAr esi pasiruošęs? Daugiau informacijos jau netrukus. #magiskasmiskas", "media_type": "VIDEO", "media_url": "https://www.magiskasmiskas.lt/instagram/3996961478521852714-019af0b93b16.jpg", "thumbnail_url": "https://www.magiskasmiskas.lt/instagram/3996961478521852714-019af0b93b16.jpg", "video_url": "https://www.magiskasmiskas.lt/instagram/3996961478521852714-7eadbe7d4866.mp4"}]}$feed$::jsonb) on conflict(id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('instagram-media','instagram-media',true,41943040,array['image/jpeg','video/mp4']) on conflict(id) do nothing;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
commit;
