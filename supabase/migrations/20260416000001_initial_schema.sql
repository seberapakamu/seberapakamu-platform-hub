-- ============================================================
-- Migration: Initial Schema for "Seberapa Wibu Kamu?"
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: questions
-- Soal-soal kuis, dikelola via Admin Panel
-- ============================================================
create table if not exists public.questions (
  id          bigserial primary key,
  teks        text        not null,
  tipe        text        not null check (tipe in ('ya_tidak', 'skala_1_5')),
  kategori    text        not null check (kategori in ('Tonton', 'Koleksi', 'Bahasa', 'Komunitas', 'Genre')),
  bobot       numeric     not null default 1.0,
  opsi_jawaban jsonb      not null default '[]',
  aktif       boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.questions enable row level security;

-- Public can read active questions
create policy "Public read active questions"
  on public.questions for select
  using (aktif = true);

-- Only authenticated admins can insert/update/delete
create policy "Admin full access questions"
  on public.questions for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: sessions
-- Tracking sesi kuis pengguna untuk analytics
-- ============================================================
create table if not exists public.sessions (
  id            uuid        primary key default gen_random_uuid(),
  hash          text        unique not null,
  username      text        not null,
  score         numeric,
  tier          text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  share_clicked boolean     not null default false,
  duration_seconds integer
);

-- RLS
alter table public.sessions enable row level security;

-- Public can insert new sessions (anonymous quiz takers)
create policy "Public insert sessions"
  on public.sessions for insert
  with check (true);

-- Public can read their own session by hash
create policy "Public read session by hash"
  on public.sessions for select
  using (true);

-- Public can update their own session (finish, share click)
create policy "Public update sessions"
  on public.sessions for update
  using (true);

-- Admins can read all sessions
create policy "Admin full access sessions"
  on public.sessions for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: articles
-- Konten blog, wiki, dan halaman informasi (CMS)
-- ============================================================
create table if not exists public.articles (
  id          bigserial   primary key,
  judul       text        not null,
  slug        text        unique not null,
  konten      text        not null default '',
  status      text        not null default 'draft' check (status in ('draft', 'published')),
  gambar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.articles enable row level security;

-- Public can read published articles
create policy "Public read published articles"
  on public.articles for select
  using (status = 'published');

-- Only authenticated admins can manage articles
create policy "Admin full access articles"
  on public.articles for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: quiz_config
-- Konfigurasi platform (timer, dll) dikelola admin
-- ============================================================
create table if not exists public.quiz_config (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.quiz_config enable row level security;

-- Public can read config
create policy "Public read config"
  on public.quiz_config for select
  using (true);

-- Only admins can update config
create policy "Admin full access config"
  on public.quiz_config for all
  using (auth.role() = 'authenticated');

-- Default config values
insert into public.quiz_config (key, value) values
  ('timer_enabled', 'false'),
  ('timer_duration_minutes', '30')
on conflict (key) do nothing;

-- ============================================================
-- FUNCTION: auto-update updated_at timestamp
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.handle_updated_at();

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.handle_updated_at();

create trigger quiz_config_updated_at
  before update on public.quiz_config
  for each row execute function public.handle_updated_at();
