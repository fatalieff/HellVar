-- ============================================
-- USTA QİYMƏT ARALIĞI - provider_details-ə sütunlar
-- ============================================

alter table public.provider_details
  add column if not exists price_min numeric(10,2),
  add column if not exists price_max numeric(10,2);

-- Min qiymət 0-dan kiçik ola bilməz
alter table public.provider_details
  drop constraint if exists provider_details_price_min_check;

alter table public.provider_details
  add constraint provider_details_price_min_check
    check (price_min is null or price_min >= 0);

-- Maks qiymət 0-dan kiçik ola bilməz
alter table public.provider_details
  drop constraint if exists provider_details_price_max_check;

alter table public.provider_details
  add constraint provider_details_price_max_check
    check (price_max is null or price_max >= 0);

-- Min, maks-dan böyük ola bilməz
alter table public.provider_details
  drop constraint if exists provider_details_price_range_check;

alter table public.provider_details
  add constraint provider_details_price_range_check
    check (price_min is null or price_max is null or price_min <= price_max);
