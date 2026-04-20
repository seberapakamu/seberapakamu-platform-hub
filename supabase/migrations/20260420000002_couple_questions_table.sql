-- ============================================================
-- Migration: Couple Sync Questions Table
-- ============================================================

create table if not exists public.couple_questions (
  id          bigserial primary key,
  teks        text        not null,
  opsi        jsonb       not null default '[]', -- [{label: "...", value: "A"}, ...]
  aktif       boolean     not null default true,
  urutan      integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.couple_questions enable row level security;

-- Public can read active questions
create policy "Public read active couple questions"
  on public.couple_questions for select
  using (aktif = true);

-- Only authenticated admins can manage
create policy "Admin full access couple questions"
  on public.couple_questions for all
  using (auth.role() = 'authenticated');

-- Trigger for updated_at
create trigger couple_questions_updated_at
  before update on public.couple_questions
  for each row execute function public.handle_updated_at();

-- Seed initial questions
insert into public.couple_questions (id, teks, opsi, urutan) values
  (1, 'Apa tipe kencan favorit kalian?', '[{"label": "Dinner Romantis", "value": "A"}, {"label": "Main Game Bareng", "value": "B"}]', 1),
  (2, 'Liburan impian kalian ke mana?', '[{"label": "Pantai yang Tenang", "value": "A"}, {"label": "Gunung yang Sejuk", "value": "B"}]', 2),
  (3, 'Kalau ada masalah, biasanya...', '[{"label": "Langsung diobrolin", "value": "A"}, {"label": "Kasih waktu buat sendiri dulu", "value": "B"}]', 3),
  (4, 'Siapa yang lebih sering ngalah?', '[{"label": "Aku", "value": "A"}, {"label": "Dia", "value": "B"}]', 4),
  (5, 'Tipe komunikasi kalian...', '[{"label": "Chattingan terus", "value": "A"}, {"label": "Video call / Telepon", "value": "B"}]', 5),
  (6, 'Lebih suka dikasih apa?', '[{"label": "Barang / Kado", "value": "A"}, {"label": "Waktu / Deep talk", "value": "B"}]', 6),
  (7, 'Kegiatan di rumah paling seru?', '[{"label": "Nonton Film/Netflix", "value": "A"}, {"label": "Masak Bareng", "value": "B"}]', 7),
  (8, 'Siapa yang paling pelupa?', '[{"label": "Aku", "value": "A"}, {"label": "Dia", "value": "B"}]', 8),
  (9, 'Kalau lagi kangen...', '[{"label": "Langsung bilang", "value": "A"}, {"label": "Kasih kode-kode", "value": "B"}]', 9),
  (10, 'Pilih mana: Masa Depan atau Sekarang?', '[{"label": "Nabung buat masa depan", "value": "A"}, {"label": "Nikmatin momen sekarang", "value": "B"}]', 10)
on conflict (id) do update set 
  teks = excluded.teks,
  opsi = excluded.opsi,
  urutan = excluded.urutan;
