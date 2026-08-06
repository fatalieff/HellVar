-- ============================================
-- RƏY (REVIEW) SİSTEMİ - TƏKMİL ETDİRİLMİŞ MİQRA
-- ============================================

-- 1. Funksiyalara icazələr - RLS-də istifadə olunan refresh_provider_rating üçün
grant execute on function public.refresh_provider_rating(uuid) to authenticated;
grant execute on function public.sync_provider_rating() to authenticated;
grant execute on function public.touch_provider_review_updated_at() to authenticated;

-- 2. Customer_id indeksi - hər müştərinin rəylərini hızlı tapmaq üçün
create index if not exists provider_reviews_customer_id_idx
  on public.provider_reviews (customer_id, created_at desc);

-- 3. Provider_details RLS və grants (rating trigger-in çalışması üçün)
alter table public.provider_details enable row level security;

grant select, insert, update, delete on public.provider_details to authenticated;

-- 4. Provider_details select policy (hamı təsdiqlənmiş provayder görə bilər)
drop policy if exists "Anyone can read approved provider details" on public.provider_details;
create policy "Anyone can read approved provider details"
  on public.provider_details for select to authenticated
  using (profile_status = 'APPROVED' or user_id = (select auth.uid()));

-- 5. Providerlar öz detallarını yeniləyə bilər
drop policy if exists "Providers can update their own details" on public.provider_details;
create policy "Providers can update their own details"
  on public.provider_details for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 6. Providerlar öz detallarını insert edə bilər (onboarding)
drop policy if exists "Providers can insert their own details" on public.provider_details;
create policy "Providers can insert their own details"
  on public.provider_details for insert to authenticated
  with check (user_id = (select auth.uid()));

-- 7. Reviews üçün rating trigger-i service_role olmadan da çalışsın
-- security definer olduğu üçün problem olmaz, lakin triggerin sahibliyi yoxlanılır
alter function public.sync_provider_rating() owner to postgres;
alter function public.refresh_provider_rating(uuid) owner to postgres;

-- 8. Rəylərin minimum uzunluğu üçün yeni check (1 simvola qədər azalt / unicode trim)
alter table public.provider_reviews
  drop constraint if exists provider_reviews_comment_check;

alter table public.provider_reviews
  add constraint provider_reviews_comment_check
  check (comment is null or char_length(btrim(comment)) between 2 and 1000);
