-- ============================================================
-- Notifications System
-- ============================================================

-- 1. Create notifications table
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('new_message', 'new_review', 'review_reply', 'system')),
  title        text not null,
  body         text,
  related_id   uuid,   -- e.g. review id, message id
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 2. Index for fast per-user queries
create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx  on public.notifications(user_id, is_read) where is_read = false;

-- 3. Enable RLS
alter table public.notifications enable row level security;

-- 4. RLS policies: users can only see / update their own notifications
create policy "Users can read own notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can mark own notifications as read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Allow the system (service role) to insert notifications
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- 5. Enable realtime for this table so the navbar can subscribe
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- Trigger: create a notification whenever a provider_review is
-- inserted. The notification goes to the provider (user_id = provider_id).
-- ============================================================

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

drop trigger if exists trg_notify_provider_on_review on public.provider_reviews;

create trigger trg_notify_provider_on_review
  after insert on public.provider_reviews
  for each row
  execute function public.notify_provider_on_review();
