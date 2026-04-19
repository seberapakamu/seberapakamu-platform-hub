-- Migration: Ganti siluet_url dengan image_url + crop fields
-- Jalankan di Supabase SQL Editor

ALTER TABLE anime_characters
  ADD COLUMN IF NOT EXISTS image_url  TEXT,
  ADD COLUMN IF NOT EXISTS crop_x     FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_y     FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_width  FLOAT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS crop_height FLOAT NOT NULL DEFAULT 100;

-- Migrate data lama: copy siluet_url ke image_url
UPDATE anime_characters
SET image_url = siluet_url
WHERE image_url IS NULL AND siluet_url IS NOT NULL;

-- Setelah migrasi berhasil, kolom siluet_url bisa di-drop:
-- ALTER TABLE anime_characters DROP COLUMN IF EXISTS siluet_url;

-- Buat storage bucket untuk gambar karakter (jika belum ada)
-- Jalankan di Supabase Dashboard > Storage > New Bucket
-- Nama: anime-characters, Public: true
