-- ============================================================
-- Migration: admin_users table
-- ============================================================

create table if not exists public.admin_users (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.admin_users enable row level security;

-- Authenticated users can read their own row
create policy "Users read own admin row"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = id);

-- Service role can insert (for seeding)
create policy "Service role insert admin users"
  on public.admin_users for insert
  to service_role
  with check (true);
