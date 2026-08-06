-- ============================================================
-- Fix: Notifications RLS + Trigger (idempotent)
-- ============================================================

-- 1. Ensure notifications table exists (idempotent)
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('new_message', 'new_review', 'review_reply', 'system')),
  title        text not null,
  body         text,
  related_id   uuid,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 2. Indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx  on public.notifications(user_id, is_read) where is_read = false;

-- 3. RLS
alter table public.notifications enable row level security;

-- 4. Fix RLS policies: drop and recreate with correct roles

-- Read policy
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

-- Update policy (mark as read)
drop policy if exists "Users can mark own notifications as read" on public.notifications;
create policy "Users can mark own notifications as read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Insert policy: allow authenticated users to insert notifications
-- (needed for client-side fallback AND for trigger which runs as security definer)
drop policy if exists "Service role can insert notifications" on public.notifications;
drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert to authenticated
  with check (true);

-- 5. Grant permissions
grant select, insert, update on public.notifications to authenticated;

-- 6. Realtime publication (idempotent check)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- 7. Recreate the trigger function (idempotent)
create or replace function public.notify_provider_on_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_name text;
begin
  -- Get customer name
  select coalesce(first_name || ' ' || last_name, 'Müştəri')
    into v_customer_name
    from public.profiles
   where id = new.customer_id;

  insert into public.notifications (user_id, type, title, body, related_id)
  values (
    new.provider_id,
    'new_review',
    v_customer_name || ' sizə rəy yazdı',
    coalesce(new.comment, 'Yeni rəy: ' || new.rating || ' ulduz'),
    new.id
  );

  return new;
end;
$$;

-- 8. Recreate trigger (idempotent)
drop trigger if exists trg_notify_provider_on_review on public.provider_reviews;

create trigger trg_notify_provider_on_review
  after insert on public.provider_reviews
  for each row
  execute function public.notify_provider_on_review();
