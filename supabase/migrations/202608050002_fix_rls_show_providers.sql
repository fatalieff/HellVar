-- ============================================
-- RLS İLƏ USTALARIN GÖRÜNMƏSİ MƏSƏLƏSİNİ DÜZƏLT
-- ============================================

-- 1. Provider_details - BÜTÜN PROVIDERLƏR GÖRÜNSÜN (APPROVED/PENDING)
--    Sadəcə özü olmayan istifadəçilər üçün statusları badge ilə göstər
drop policy if exists "Anyone can read approved provider details" on public.provider_details;

create policy "Authenticated users can read all provider details"
  on public.provider_details for select to authenticated
  using (true);

-- 2. Public profiles - Hər kəs hamının ad,soyad, ünvanını görə bilsin
alter table public.profiles enable row level security;

drop policy if exists "Public profiles read" on public.profiles;
create policy "Authenticated users can read basic profile info"
  on public.profiles for select to authenticated
  using (true);

-- 3. Profiles-a grants əlavə et
grant select, insert, update, delete on public.profiles to authenticated;

-- 4. Provider_reviews select - daha öncəndən var, amma təkrarlayaq (daxili JOIN-lar üçün vacibdir)
drop policy if exists "Authenticated users can read provider reviews" on public.provider_reviews;
create policy "Authenticated users can read provider reviews"
  on public.provider_reviews for select to authenticated
  using (true);
