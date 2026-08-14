-- ============================================================
-- Lokasiya sistemi: profiles.latitude + profiles.longitude
-- Müştəri və usta qeydiyyatda rayon seçərkən mərkəz koordinatları
-- bu sütunlara yazılır və dashboard xəritəsi (Leaflet) buradan oxuyur.
-- ============================================================

-- 1. latitude / longitude sütunları (idempotent)
alter table public.profiles
  add column if not exists latitude double precision;

alter table public.profiles
  add column if not exists longitude double precision;

comment on column public.profiles.latitude  is 'İstifadəçinin lokasiyası - en dairəsi (Bakı rayonunun mərkəzi)';
comment on column public.profiles.longitude is 'İstifadəçinin lokasiyası - uzunluq dairəsi (Bakı rayonunun mərkəzi)';

-- 2. Profil yeniləmə RLS policy (köhnə istifadəçi "digər" lokasiyasını güncəlləyə bilsin)
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. Hər kəs (authenticated) oxuya bilsin - xəritədə digər istifadəçilərin lokasiyası görünməsi üçün
drop policy if exists "Public profiles read" on public.profiles;
create policy "Public profiles read"
  on public.profiles for select to authenticated
  using (true);

grant select, insert, update, delete on public.profiles to authenticated;

-- 4. auth.users metadata-dan lokasiyanı avtomatik sinxronizasiya edən trigger
--    (qeydiyyat zamanı session olmasa belə koordinatlar profillərə yazılır)
create or replace function public.sync_profile_location()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.raw_user_meta_data is not null
     and new.raw_user_meta_data ? 'latitude'
     and new.raw_user_meta_data ? 'longitude'
     and new.raw_user_meta_data->>'latitude' is not null
     and new.raw_user_meta_data->>'longitude' is not null then
    update public.profiles
      set latitude  = (new.raw_user_meta_data->>'latitude')::double precision,
          longitude = (new.raw_user_meta_data->>'longitude')::double precision
      where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_location on auth.users;
create trigger trg_sync_profile_location
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_location();