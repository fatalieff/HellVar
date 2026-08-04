alter table public.provider_details
  add column if not exists bio text,
  add column if not exists years_experience integer,
  add column if not exists completed_jobs integer not null default 0;

alter table public.provider_details
  alter column years_experience drop not null;

alter table public.provider_details
  drop constraint if exists provider_details_years_experience_check;

alter table public.provider_details
  add constraint provider_details_years_experience_check
    check (years_experience is null or years_experience between 0 and 80);

alter table public.provider_details
  drop constraint if exists provider_details_completed_jobs_check;

alter table public.provider_details
  add constraint provider_details_completed_jobs_check
    check (completed_jobs >= 0);
