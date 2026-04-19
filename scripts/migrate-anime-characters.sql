-- Migration: Ubah skema anime_characters untuk mendukung gambar crop
-- Jalankan di Supabase SQL Editor

-- 1. Tambah kolom baru
ALTER TABLE anime_characters
  ADD COLUMN IF NOT EXISTS image_url  TEXT,
  ADD COLUMN IF NOT EXISTS crop_x     FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_y     FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_width  FLOAT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS crop_height FLOAT NOT NULL DEFAULT 100;

-- 2. Migrate data lama: salin siluet_url ke image_url
UPDATE anime_characters
SET image_url = siluet_url
WHERE image_url IS NULL AND siluet_url IS NOT NULL;

-- 3. Buat Supabase Storage bucket untuk gambar karakter (jika belum ada)
-- Jalankan via Supabase Dashboard > Storage > New Bucket
-- Nama bucket: anime-characters
-- Public: true

-- 4. Tambahkan RLS policy untuk storage bucket anime-characters
-- (Jalankan di Dashboard > Storage > Policies)
-- Policy: Allow public read
-- Policy: Allow authenticated upload

-- Verifikasi
SELECT id, nama, image_url, crop_x, crop_y, crop_width, crop_height FROM anime_characters LIMIT 5;
