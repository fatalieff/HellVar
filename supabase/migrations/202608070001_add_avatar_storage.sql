-- ============================================================
-- Avatar sistemi: profiles.avatar_url + "avatars" storage bucket
-- ============================================================

-- 1. Avatar URL column on public.profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- App-in istifadə etdiyi timestamp sütunları (yoxdursa əlavə et)
alter table public.profiles
  add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- 2. Public "avatars" bucket (max 5MB, yalnız şəkil formatları)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage policies (hər kəs oxuya bilər; yalnız öz şəklini yükləyə/deyə bilər)
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 4. Profil yeniləmə RLS policy (yoxdursa, əlavə et; varsa eyni adla yenilə)
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
