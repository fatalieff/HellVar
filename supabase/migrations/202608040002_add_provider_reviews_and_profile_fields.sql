alter table public.provider_details
  add column if not exists bio text,
  add column if not exists years_experience integer,
  add column if not exists completed_jobs integer not null default 0;

alter table public.provider_details
  alter column years_experience drop not null;

alter table public.provider_details
  add constraint provider_details_years_experience_check
    check (years_experience is null or years_experience between 0 and 80);

alter table public.provider_details
  add constraint provider_details_completed_jobs_check
    check (completed_jobs >= 0);

create table if not exists public.provider_reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_reviews_provider_customer_unique unique (provider_id, customer_id),
  constraint provider_reviews_not_self_review check (provider_id <> customer_id),
  constraint provider_reviews_comment_length check (comment is null or char_length(trim(comment)) between 3 and 500)
);

create index if not exists provider_reviews_provider_id_idx
  on public.provider_reviews (provider_id, created_at desc);

alter table public.provider_reviews enable row level security;

grant select, insert, update, delete on public.provider_reviews to authenticated;

create or replace function public.touch_provider_review_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists provider_reviews_set_updated_at on public.provider_reviews;
create trigger provider_reviews_set_updated_at
before update on public.provider_reviews
for each row execute function public.touch_provider_review_updated_at();

create or replace function public.refresh_provider_rating(target_provider_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_rating numeric(3,2);
begin
  select round(avg(rating)::numeric, 2)
  into avg_rating
  from public.provider_reviews
  where provider_id = target_provider_id;

  update public.provider_details
  set rating = coalesce(avg_rating, 0)
  where user_id = target_provider_id;
end;
$$;

create or replace function public.sync_provider_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_provider_rating(old.provider_id);
    return old;
  end if;

  perform public.refresh_provider_rating(new.provider_id);

  if tg_op = 'UPDATE' and old.provider_id <> new.provider_id then
    perform public.refresh_provider_rating(old.provider_id);
  end if;

  return new;
end;
$$;

drop trigger if exists provider_reviews_refresh_provider_rating on public.provider_reviews;
create trigger provider_reviews_refresh_provider_rating
after insert or update or delete on public.provider_reviews
for each row execute function public.sync_provider_rating();

create policy "Authenticated users can read provider reviews"
  on public.provider_reviews for select to authenticated
  using (true);

create policy "Customers can create their own provider reviews"
  on public.provider_reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles customer_profile
      where customer_profile.id = (select auth.uid())
        and customer_profile.role = 'CUSTOMER'
    )
  );

create policy "Customers can update their own provider reviews"
  on public.provider_reviews for update to authenticated
  using (customer_id = (select auth.uid()))
  with check (customer_id = (select auth.uid()));

create policy "Customers can delete their own provider reviews"
  on public.provider_reviews for delete to authenticated
  using (customer_id = (select auth.uid()));
