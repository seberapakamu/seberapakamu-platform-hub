-- Setup Supabase Storage untuk gambar karakter anime
-- Jalankan di Supabase SQL Editor

-- 1. Buat bucket (jika belum ada via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('anime-characters', 'anime-characters', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: siapa saja bisa baca (public)
CREATE POLICY "Public read anime-characters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'anime-characters');

-- 3. Policy: hanya user terautentikasi yang bisa upload
CREATE POLICY "Authenticated upload anime-characters"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'anime-characters'
    AND auth.role() = 'authenticated'
  );

-- 4. Policy: hanya user terautentikasi yang bisa hapus
CREATE POLICY "Authenticated delete anime-characters"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'anime-characters'
    AND auth.role() = 'authenticated'
  );
