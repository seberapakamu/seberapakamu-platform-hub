# Implementation Plan: Seberapa Wibu Kamu?

## Overview

Implementasi platform kuis interaktif berbasis Next.js 15 (App Router) dengan Tailwind CSS + DaisyUI. Alur implementasi dimulai dari fondasi proyek, lalu quiz engine, result & sharing, halaman informasi, admin panel, hingga analytics dan optimasi performa.

## Tasks

- [x] 1. Setup proyek dan fondasi teknis
  - Inisialisasi proyek Next.js 15 dengan App Router, TypeScript, Tailwind CSS v3, dan DaisyUI `cupcake` theme
  - Konfigurasi CSS variables untuk color system kawaii pastel sesuai design
  - Setup Zustand untuk state management global (quiz session, username, answers)
  - Buat struktur direktori: `app/`, `components/`, `lib/`, `data/`, `public/`
  - Buat file `quiz_purity.json` dengan schema soal (id, teks, tipe, kategori, bobot, opsi jawaban)
  - Isi minimal 30 soal dengan campuran tipe Ya/Tidak dan Skala 1-5 beserta nuansa humor
  - _Requirements: 3.1, 3.2, 3.10_

- [x] 2. Implementasi Landing Page
  - [x] 2.1 Buat halaman utama (`app/page.tsx`) dengan layout responsif
    - Tampilkan deskripsi platform, daftar kuis tersedia, dan statistik pengguna (placeholder)
    - Tambahkan navigasi ke `/wiki`, `/blog`, dan tombol mulai kuis menuju `/username`
    - Optimasi LCP dengan Next.js Image dan font preloading
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 2.2 Tulis unit test untuk komponen Landing Page
    - Test render deskripsi, daftar kuis, dan navigasi link
    - Test responsivitas dengan viewport berbeda
    - _Requirements: 1.1, 1.8_

- [x] 3. Implementasi Input Username
  - [x] 3.1 Buat halaman input username (`app/username/page.tsx`)
    - Form input dengan validasi: panjang 1-30 karakter, tolak HTML tags/script injection
    - Tampilkan pesan error spesifik untuk field kosong dan karakter tidak valid
    - Simpan username ke localStorage dan redirect ke `/quiz` saat valid
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Tulis unit test untuk validasi username
    - Test boundary: 0 karakter (error), 1 karakter (valid), 30 karakter (valid), 31 karakter (error)
    - Test sanitasi: input dengan `<script>`, HTML tags harus ditolak
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 4. Implementasi Quiz Engine
  - [x] 4.1 Buat Zustand store untuk quiz session (`lib/store/quizStore.ts`)
    - State: questions, currentIndex, answers, username, sessionId, startTime
    - Actions: initSession, setAnswer, navigate, resumeSession, resetSession, finishQuiz
    - Auto-save answers ke localStorage setiap kali jawaban berubah
    - _Requirements: 3.4, 3.5, 3.7, 3.8_

  - [x] 4.2 Buat halaman kuis (`app/quiz/page.tsx`) dengan navigasi bebas
    - Render pertanyaan berdasarkan currentIndex dari store
    - Dukung tipe Ya/Tidak (tombol) dan Skala 1-5 (slider/radio)
    - Progress bar bergaya HP/Mana yang menunjukkan persentase pertanyaan terjawab
    - Tombol navigasi maju/mundur dan tombol selesai (aktif saat semua terjawab)
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 4.3 Implementasi resume session
    - Saat halaman kuis dimuat, cek localStorage untuk sesi sebelumnya
    - Tampilkan modal pilihan "Lanjutkan" atau "Mulai Ulang"
    - Muat kembali jawaban dan posisi pertanyaan jika lanjutkan dipilih
    - Hapus data localStorage jika mulai ulang dipilih
    - _Requirements: 3.6, 3.7, 3.8_

  - [x] 4.4 Implementasi scoring engine (`lib/scoring.ts`)
    - Fungsi `calculateScore(answers, questions)` dengan formula: `Σ(bobot_soal × jawaban) / Skor_Maksimal × 100`
    - Terapkan bobot kategori: Tonton(1.2), Koleksi(1.5), Bahasa(0.8), Komunitas(1.3), Genre(1.0)
    - Fungsi `getTier(score)` yang mengembalikan 5 tier dengan judul dan deskripsi humoris
    - _Requirements: 3.9, 3.10, 3.11_

  - [x] 4.5 Tulis unit test untuk scoring engine
    - Test kalkulasi skor dengan jawaban semua 0, semua maksimal, dan campuran
    - Test pengelompokan tier untuk nilai batas (0, 20, 40, 60, 80, 100)
    - Test bobot kategori diterapkan dengan benar
    - _Requirements: 3.9, 3.10, 3.11_

  - [x] 4.6 Implementasi countdown timer (fitur opsional admin)
    - Komponen `QuizTimer` yang menerima prop `durationMinutes`
    - Tampilkan countdown dan hentikan kuis otomatis saat waktu habis
    - Aktifkan hanya jika konfigurasi admin mengaktifkan fitur ini
    - _Requirements: 3.12_

- [x] 5. Checkpoint — Pastikan semua test lulus
  - Pastikan semua unit test lulus, tanyakan ke user jika ada pertanyaan.

- [x] 6. Implementasi Halaman Hasil Kuis
  - [x] 6.1 Buat halaman hasil (`app/result/[hash]/page.tsx`)
    - Generate hash unik per sesi menggunakan `crypto.randomUUID()` atau nanoid
    - Tampilkan skor numerik, nama tier, deskripsi tier humoris, dan username
    - Tombol "Ulangi Kuis" (ke `/username`), "Tantang Teman" (shareable link), "Lihat Leaderboard"
    - Mode read-only saat URL dibuka oleh pengguna lain
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.2 Tambahkan dynamic Open Graph meta tags
    - Gunakan Next.js Metadata API untuk generate `og:image`, `og:title`, `og:description`, `twitter:card` per hash
    - Buat route `/api/og/result` menggunakan `@vercel/og` untuk generate OG image dinamis
    - _Requirements: 4.7, 6.1_

  - [x] 6.3 Tulis unit test untuk halaman hasil
    - Test render skor, tier, dan username dengan data mock
    - Test mode read-only saat hash bukan milik sesi aktif
    - _Requirements: 4.2, 4.6_

- [x] 7. Implementasi Result Card Generator
  - [x] 7.1 Buat komponen `ResultCard` (`components/ResultCard.tsx`)
    - Render kartu dengan skor, tier, username, tanggal, watermark platform, dan random quote humoris
    - Dukung 3+ template rotasi: "Sertifikat Sepuh", "Surat Izin Binge", "Lulus Akademi Waifu"
    - Pilih template secara acak saat kartu digenerate
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7_

  - [x] 7.2 Implementasi generate dan download gambar
    - Gunakan `html2canvas` untuk capture komponen `ResultCard` ke canvas
    - Generate dalam format 1080×1080 dan 1080×1920 piksel
    - Tampilkan preview sebelum download
    - Tombol download memicu `canvas.toBlob()` → `URL.createObjectURL()` → auto-download
    - Pastikan proses selesai ≤ 2 detik
    - _Requirements: 5.1, 5.2, 5.3, 5.8_

  - [x] 7.3 Tulis unit test untuk result card generator
    - Test semua field (skor, tier, username, tanggal, watermark) ada di output
    - Test pemilihan template acak menghasilkan salah satu dari template yang tersedia
    - _Requirements: 5.4, 5.6_

- [x] 8. Implementasi Social Sharing
  - [x] 8.1 Buat komponen `ShareModule` (`components/ShareModule.tsx`)
    - Tombol share ke X (Twitter), Instagram, WhatsApp, dan Telegram dengan URL pre-filled
    - Tombol "Salin Link" yang menyalin `/result/{hash}` ke clipboard
    - Deteksi Web Share API; tampilkan fallback copy-to-clipboard jika tidak didukung
    - _Requirements: 6.1, 6.2, 6.6, 6.7_

  - [x] 8.2 Implementasi caption generator
    - Fungsi `generateCaption(tier, style)` dengan variasi: roast, praise, dramatis, meme
    - Sertakan hashtag dinamis sesuai tier
    - Tombol "Acak Ulang Caption" yang memanggil ulang fungsi dengan style berbeda
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 8.3 Tulis unit test untuk caption generator
    - Test setiap style (roast, praise, dramatis, meme) menghasilkan teks berbeda
    - Test hashtag sesuai tier yang diberikan
    - _Requirements: 6.3, 6.4_

- [x] 9. Checkpoint — Pastikan semua test lulus
  - Pastikan semua unit test lulus, tanyakan ke user jika ada pertanyaan.

- [x] 10. Implementasi Halaman Informasi & Wiki
  - [x] 10.1 Buat halaman `/wiki` dan `/tentang-wibu` (`app/wiki/page.tsx`, `app/tentang-wibu/page.tsx`)
    - Konten dengan format FAQ, meme breakdown, dan timeline interaktif ringan
    - Tambahkan disclaimer hak cipta dan fair use
    - Optimasi SEO dengan Next.js Metadata API (title, description, canonical)
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 10.2 Pastikan performa dan responsivitas halaman informasi
    - Gunakan SSG (Static Site Generation) untuk loading ≤ 1 detik
    - Pastikan responsif di semua ukuran layar (320px–1920px)
    - Navigasi tidak mengganggu alur kuis yang sedang berjalan (state kuis tetap di localStorage)
    - _Requirements: 7.3, 7.4, 7.7, 12.2_

- [x] 11. Implementasi Autentikasi Admin
  - [x] 11.1 Setup Supabase dan konfigurasi autentikasi
    - Inisialisasi Supabase client (`lib/supabase.ts`)
    - Buat tabel `admin_users` dengan RLS policy
    - Konfigurasi environment variables untuk Supabase URL dan anon key
    - _Requirements: 8.5_

  - [x] 11.2 Buat halaman login admin (`app/admin/login/page.tsx`)
    - Form email dan password dengan validasi client-side
    - Panggil Supabase Auth `signInWithPassword` saat submit
    - Tampilkan pesan error generik (tanpa mengungkapkan field mana yang salah) saat login gagal
    - Implementasi lockout 15 menit setelah 5 kali gagal (simpan counter di localStorage/cookie)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 11.3 Implementasi session management dan route protection
    - Buat middleware Next.js (`middleware.ts`) untuk proteksi semua route `/admin/*`
    - Redirect ke `/admin/login` jika tidak terautentikasi
    - Auto-logout setelah 60 menit tidak aktif menggunakan Supabase session expiry
    - Tombol logout yang menghapus sesi dan redirect ke `/admin/login`
    - _Requirements: 8.6, 8.7, 8.8_

  - [x] 11.4 Tulis unit test untuk autentikasi admin
    - Test redirect ke login saat akses `/admin/*` tanpa sesi
    - Test lockout setelah 5 kali gagal login
    - _Requirements: 8.4, 8.8_

- [x] 12. Implementasi Manajemen Soal Kuis (Admin)
  - [x] 12.1 Buat tabel `questions` di Supabase dan CRUD API routes
    - Schema: id, teks, tipe (ya_tidak | skala_1_5), kategori, bobot, opsi_jawaban, aktif, created_at
    - API routes: `GET/POST /api/admin/questions`, `PUT/DELETE /api/admin/questions/[id]`
    - Validasi server-side: semua field wajib harus terisi sebelum disimpan
    - _Requirements: 9.1, 9.5, 9.6_

  - [x] 12.2 Buat halaman manajemen soal (`app/admin/questions/page.tsx`)
    - Tabel daftar soal dengan kolom: teks, tipe, kategori, bobot, status aktif
    - Form tambah/edit soal dengan validasi per field dan pesan error spesifik
    - Tombol hapus dengan dialog konfirmasi sebelum penghapusan
    - Toggle aktif/nonaktif soal tanpa menghapus
    - Konfigurasi durasi waktu kuis (menit) jika fitur timer diaktifkan
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 9.8_

- [x] 13. Implementasi CMS (Manajemen Konten)
  - [x] 13.1 Buat tabel `articles` di Supabase
    - Schema: id, judul, slug, konten (rich text/HTML), status (draft | published), gambar_url, updated_at
    - API routes: `GET/POST /api/admin/articles`, `PUT/DELETE /api/admin/articles/[id]`
    - _Requirements: 10.2, 10.6, 10.8_

  - [x] 13.2 Buat halaman manajemen konten (`app/admin/content/page.tsx`)
    - Integrasikan rich text editor (misalnya TipTap atau Quill) untuk buat/edit artikel
    - Dukung upload gambar ke Supabase Storage
    - Tombol publish/unpublish dan simpan draft
    - Daftar semua konten dengan status (draft/published) dan tanggal terakhir diubah
    - Dialog konfirmasi sebelum menghapus artikel yang sudah dipublikasikan
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 13.3 Tampilkan artikel yang dipublikasikan di halaman blog publik (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`)
    - Fetch artikel dengan status `published` dari Supabase
    - Render konten artikel dengan SSR/ISR untuk SEO
    - _Requirements: 10.5_

- [x] 14. Checkpoint — Pastikan semua test lulus
  - Pastikan semua unit test lulus, tanyakan ke user jika ada pertanyaan.

- [x] 15. Implementasi Statistik & Analytics (Admin)
  - [x] 15.1 Buat tabel `sessions` di Supabase untuk tracking
    - Schema: id, started_at, finished_at, tier, score, share_clicked
    - Catat sesi dimulai saat quiz init, update saat selesai dan saat share diklik
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 15.2 Buat halaman dashboard admin (`app/admin/dashboard/page.tsx`)
    - Tampilkan: total sesi dimulai, total selesai, completion rate `(Selesai/Dimulai)×100`
    - Tampilkan: share rate `(Klik Share/Selesai)×100`, distribusi tier, rata-rata durasi sesi
    - Query agregasi dari tabel `sessions` via Supabase
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 15.3 Integrasikan Plausible atau Umami analytics
    - Tambahkan script analytics ke `app/layout.tsx`
    - Pastikan tidak melanggar privasi pengguna (no PII tracking)
    - _Requirements: 11.6_

- [x] 16. Optimasi Performa & Aksesibilitas
  - [x] 16.1 Optimasi performa halaman
    - Audit LCP halaman utama, pastikan ≤ 1.2 detik (Next.js Image, font preload, SSG)
    - Audit loading halaman informasi, pastikan ≤ 1 detik
    - Pastikan generate result card ≤ 2 detik (profiling html2canvas)
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 16.2 Implementasi aksesibilitas
    - Audit dan perbaiki rasio kontras warna minimal 4.5:1 untuk semua teks konten
    - Pastikan semua elemen interaktif dapat diakses via keyboard (focus ring, tab order)
    - Tambahkan `alt` text untuk semua gambar konten
    - Pastikan responsif di viewport 320px–1920px
    - _Requirements: 12.4, 12.5, 12.6, 12.7_

  - [x] 16.3 Buat halaman error 404 (`app/not-found.tsx`)
    - Tampilkan pesan humoris bertema anime (contoh: "Kamu tersesat di Isekai. Balik ke halaman awal?")
    - Sertakan tautan kembali ke halaman utama
    - _Requirements: 12.8_

- [x] 17. Wiring dan integrasi akhir
  - [x] 17.1 Hubungkan quiz engine dengan result page
    - Setelah scoring selesai, simpan hasil ke Supabase (`sessions` table) dan generate hash
    - Redirect ke `/result/{hash}` dengan data skor, tier, dan username
    - _Requirements: 4.1, 3.9_

  - [x] 17.2 Hubungkan statistik landing page dengan data real
    - Fetch total sesi dari Supabase untuk ditampilkan di landing page secara real-time (atau ISR 60 detik)
    - _Requirements: 1.2_

  - [x] 17.3 Tulis integration test untuk alur utama
    - Test alur lengkap: input username → jawab semua soal → lihat hasil → download kartu → share
    - _Requirements: 2.5, 3.9, 4.1, 5.8, 6.7_

- [ ] 18. Final Checkpoint — Pastikan semua test lulus
  - Pastikan semua unit test dan integration test lulus, tanyakan ke user jika ada pertanyaan.

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceabilitas
- Checkpoint memastikan validasi inkremental di setiap fase
- Gunakan TypeScript strict mode di seluruh proyek
- Semua komponen harus responsif (mobile-first dengan Tailwind)
