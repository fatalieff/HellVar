create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_low uuid not null references public.profiles(id) on delete cascade,
  participant_high uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint chat_conversations_distinct_participants check (participant_low <> participant_high),
  constraint chat_conversations_canonical_participants check (participant_low < participant_high),
  unique (participant_low, participant_high)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

grant select, insert on public.chat_conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;

create policy "Participants can view conversations"
  on public.chat_conversations for select to authenticated
  using ((select auth.uid()) in (participant_low, participant_high));

create policy "Users can start conversations they participate in"
  on public.chat_conversations for insert to authenticated
  with check (
    (select auth.uid()) in (participant_low, participant_high)
    and participant_low < participant_high
  );

create policy "Participants can view messages"
  on public.chat_messages for select to authenticated
  using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.participant_low, c.participant_high)
  ));

create policy "Participants can send messages as themselves"
  on public.chat_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.participant_low, c.participant_high)
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
