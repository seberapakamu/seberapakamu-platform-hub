-- ============================================================
-- Migration: Couple Sync Test for "Seberapa Bucin Kamu?"
-- ============================================================

-- TABLE: couple_rooms
-- Menampung data room untuk sinkronisasi pasangan
create table if not exists public.couple_rooms (
  id            uuid        primary key default gen_random_uuid(),
  code          text        unique not null,
  user1_name    text,
  user2_name    text,
  status        text        not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '24 hours')
);

-- TABLE: couple_answers
-- Menampung jawaban masing-masing user dalam room
create table if not exists public.couple_answers (
  id            uuid        primary key default gen_random_uuid(),
  room_id       uuid        not null references public.couple_rooms(id) on delete cascade,
  user_index    integer     not null check (user_index in (1, 2)),
  answers       jsonb       not null default '[]',
  is_finished   boolean     not null default false,
  updated_at    timestamptz not null default now(),
  unique(room_id, user_index)
);

-- RLS
alter table public.couple_rooms enable row level security;
alter table public.couple_answers enable row level security;

-- Public access (since users are anonymous)
create policy "Public full access couple_rooms" on public.couple_rooms for all using (true) with check (true);
create policy "Public full access couple_answers" on public.couple_answers for all using (true) with check (true);

-- Enable Realtime for these tables
alter publication supabase_realtime add table couple_rooms;
alter publication supabase_realtime add table couple_answers;

-- Trigger for updated_at
create trigger couple_rooms_updated_at
  before update on public.couple_rooms
  for each row execute function public.handle_updated_at();

create trigger couple_answers_updated_at
  before update on public.couple_answers
  for each row execute function public.handle_updated_at();
