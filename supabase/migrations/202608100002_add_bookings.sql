-- ============================================================
-- Booking System (Sifariş / Rezervasiya)
-- ============================================================

-- 1. Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  service text not null check (char_length(trim(service)) between 1 and 200),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60
    check (duration_minutes in (30, 60, 90, 120, 180, 240)),
  price_offer numeric(10, 2) not null default 0 check (price_offer >= 0),
  address text,
  customer_note text,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_customer_not_provider check (customer_id <> provider_id),
  constraint bookings_customer_note_length check (customer_note is null or char_length(trim(customer_note)) <= 500)
);

-- 2. Indexes
create index if not exists bookings_provider_status_idx
  on public.bookings (provider_id, status, scheduled_at);
create index if not exists bookings_customer_status_idx
  on public.bookings (customer_id, status, scheduled_at);
create index if not exists bookings_scheduled_at_idx
  on public.bookings (scheduled_at);

-- 3. Extend notifications type constraint to allow booking types
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in ('new_message', 'new_review', 'review_reply', 'system',
                  'new_booking', 'booking_accepted', 'booking_rejected',
                  'booking_completed', 'booking_cancelled'));

-- 4. RLS
alter table public.bookings enable row level security;

grant select, insert, update on public.bookings to authenticated;

drop policy if exists "Customers can view own bookings" on public.bookings;
create policy "Customers can view own bookings"
  on public.bookings for select to authenticated
  using (customer_id = (select auth.uid()));

drop policy if exists "Providers can view their bookings" on public.bookings;
create policy "Providers can view their bookings"
  on public.bookings for select to authenticated
  using (provider_id = (select auth.uid()));

drop policy if exists "Customers can create bookings" on public.bookings;
create policy "Customers can create bookings"
  on public.bookings for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and exists (
      select 1 from public.profiles customer_profile
      where customer_profile.id = (select auth.uid())
        and customer_profile.role = 'CUSTOMER'
    )
  );

drop policy if exists "Customers can cancel own bookings" on public.bookings;
create policy "Customers can cancel own bookings"
  on public.bookings for update to authenticated
  using (customer_id = (select auth.uid()))
  with check (
    customer_id = (select auth.uid())
    and status = 'CANCELLED'
  );

drop policy if exists "Providers can manage their bookings" on public.bookings;
create policy "Providers can manage their bookings"
  on public.bookings for update to authenticated
  using (provider_id = (select auth.uid()))
  with check (
    provider_id = (select auth.uid())
    and status in ('ACCEPTED', 'REJECTED', 'COMPLETED')
  );

-- 5. Triggers

-- 5.1 Keep updated_at fresh
create or replace function public.touch_booking_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_booking_set_updated_at on public.bookings;
create trigger trg_booking_set_updated_at
  before update on public.bookings
  for each row execute function public.touch_booking_updated_at();

-- 5.2 Validate status transitions
create or replace function public.validate_booking_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'PENDING' then
    if new.status not in ('ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED') then
      raise exception 'Invalid booking status transition: PENDING -> %', new.status;
    end if;
  elsif old.status = 'ACCEPTED' then
    if new.status not in ('COMPLETED', 'CANCELLED') then
      raise exception 'Invalid booking status transition: ACCEPTED -> %', new.status;
    end if;
  else
    raise exception 'Booking status % is final and cannot be changed', old.status;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_booking_status on public.bookings;
create trigger trg_validate_booking_status
  before update on public.bookings
  for each row execute function public.validate_booking_status();

-- 5.3 Bump provider completed_jobs when a booking is completed once
create or replace function public.bump_completed_jobs_on_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'COMPLETED' and old.status <> 'COMPLETED' then
    update public.provider_details
    set completed_jobs = completed_jobs + 1
    where user_id = new.provider_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_completed_jobs_on_booking on public.bookings;
create trigger trg_bump_completed_jobs_on_booking
  after update on public.bookings
  for each row execute function public.bump_completed_jobs_on_booking();

-- 6. Notifications

-- 6.1 New booking -> provider
create or replace function public.notify_provider_on_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_name text;
begin
  select coalesce(first_name || ' ' || last_name, 'Müştəri')
    into v_customer_name
    from public.profiles
   where id = new.customer_id;

  insert into public.notifications (user_id, type, title, body, related_id)
  values (
    new.provider_id,
    'new_booking',
    'Yeni sifariş: ' || new.service,
    v_customer_name || ' · ' ||
    to_char(new.scheduled_at at time zone 'Asia/Baku', 'DD.MM.YYYY HH24:MI'),
    new.id
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_provider_on_new_booking on public.bookings;
create trigger trg_notify_provider_on_new_booking
  after insert on public.bookings
  for each row execute function public.notify_provider_on_new_booking();

-- 6.2 Booking status change -> customer (accept/reject/complete) or provider (cancel)
create or replace function public.notify_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other_name text;
  v_target_id uuid;
  v_type text;
  v_title text;
  v_body text;
begin
  if new.status = old.status then
    return new;
  end if;

  case new.status
    when 'ACCEPTED' then
      v_target_id := new.customer_id;
      v_type := 'booking_accepted';
      v_title := 'Sifarişiniz qəbul edildi';
      select coalesce(first_name || ' ' || last_name, 'Usta')
        into v_other_name from public.profiles where id = new.provider_id;
      v_body := v_other_name || ' sifarişinizi qəbul etdi: ' || new.service;
    when 'REJECTED' then
      v_target_id := new.customer_id;
      v_type := 'booking_rejected';
      v_title := 'Sifariş redd edildi';
      select coalesce(first_name || ' ' || last_name, 'Usta')
        into v_other_name from public.profiles where id = new.provider_id;
      v_body := v_other_name || ' sifarişi redd etdi: ' || new.service;
    when 'COMPLETED' then
      v_target_id := new.customer_id;
      v_type := 'booking_completed';
      v_title := 'Sifariş tamamlandı';
      select coalesce(first_name || ' ' || last_name, 'Usta')
        into v_other_name from public.profiles where id = new.provider_id;
      v_body := v_other_name || ' işi tamamladı: ' || new.service;
    when 'CANCELLED' then
      v_target_id := new.provider_id;
      v_type := 'booking_cancelled';
      v_title := 'Sifariş ləğv edildi';
      select coalesce(first_name || ' ' || last_name, 'Müştəri')
        into v_other_name from public.profiles where id = new.customer_id;
      v_body := v_other_name || ' sifarişi ləğv etdi: ' || new.service;
    else
      return new;
  end case;

  insert into public.notifications (user_id, type, title, body, related_id)
  values (v_target_id, v_type, v_title, v_body, new.id);

  return new;
end;
$$;

drop trigger if exists trg_notify_booking_status_change on public.bookings;
create trigger trg_notify_booking_status_change
  after update on public.bookings
  for each row execute function public.notify_booking_status_change();

-- 7. Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
