# Rencana Implementasi: Platform Hub "Seberapa Kamu?"

## Overview

Implementasi dilakukan dalam 6 fase berurutan: fondasi data & konfigurasi, refactor route wibu (operasi berisiko), pembuatan komponen hub, hub landing page, penulisan tests, dan verifikasi integrasi. Urutan ini memastikan tidak ada kode yang menggantung — setiap langkah langsung terintegrasi ke langkah sebelumnya.

**Bahasa:** TypeScript / TSX (Next.js App Router)
**Testing:** Jest + React Testing Library + fast-check (PBT)

> ⚠️ **Catatan Refactor Wibu:** Fase 2 adalah operasi berisiko. Buat struktur baru dulu, pindahkan konten, baru hapus yang lama. Jangan hapus file lama sebelum file baru terverifikasi berfungsi.

---

## Tasks

- [x] 1. Setup fondasi: install dependency, data model modul, dan konfigurasi redirect
  - [x] 1.1 Install fast-check sebagai dev dependency
    - Jalankan `npm install --save-dev fast-check`
    - Verifikasi `fast-check` muncul di `devDependencies` pada `package.json`
    - _Requirements: Testing Strategy (design.md)_

  - [x] 1.2 Buat interface `Module` dan konfigurasi `MODULES` di `lib/hub/modules.ts`
    - Buat file `lib/hub/modules.ts`
    - Definisikan type `ModuleStatus = 'active' | 'coming_soon'`
    - Definisikan interface `Module` dengan field: `id`, `name`, `slug`, `description`, `accentColor`, `mascotEmoji`, `mascotAlt`, `status`, `href`, `category?`
    - Ekspor konstanta `MODULES: Module[]` dengan 3 modul: wibu (active), bucin (coming_soon), introvert (coming_soon) sesuai spesifikasi design
    - Tambahkan komentar konvensi penamaan Route Group untuk modul baru
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 1.3 Tambahkan redirect rules ke `next.config.ts`
    - Tambahkan fungsi `async redirects()` ke konfigurasi NextConfig
    - Implementasikan 7 redirect rules dengan `permanent: true`:
      - `/username` → `/wibu/username`
      - `/quiz` → `/wibu/quiz`
      - `/result/:hash` → `/wibu/result/:hash`
      - `/wiki` → `/wibu/wiki`
      - `/tentang-wibu` → `/wibu/tentang-wibu`
      - `/blog` → `/wibu/blog`
      - `/blog/:slug` → `/wibu/blog/:slug`
    - Pastikan tidak ada redirect yang menyentuh `/admin/*`
    - _Requirements: 3.2, 7.1, 7.2, 7.3, 7.5_

- [x] 2. Refactor root layout menjadi minimal wrapper
  - [x] 2.1 Ubah `app/layout.tsx` menjadi minimal wrapper
    - Hapus import `Nunito` font, `globals.css`, `Script` Plausible, dan semua metadata wibu dari `app/layout.tsx`
    - Pertahankan hanya `<html lang="id">` dan `<body>{children}</body>`
    - Ekspor metadata minimal (tanpa title/description spesifik wibu)
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 3. Refactor route wibu ke Route Group `(wibu)`
  - [x] 3.1 Buat struktur direktori Route Group wibu
    - Buat direktori `app/(wibu)/wibu/`
    - Buat direktori-direktori sub-route: `username/`, `quiz/`, `result/[hash]/`, `wiki/`, `tentang-wibu/`, `blog/`, `blog/[slug]/`
    - _Requirements: 3.1, 3.4, 5.1_

  - [x] 3.2 Buat `app/(wibu)/wibu/layout.tsx` — layout wibu yang diperbarui
    - Pindahkan import `Nunito` font dari root layout ke sini
    - Pindahkan import `globals.css` dari root layout ke sini
    - Pindahkan import `Script` Plausible analytics dari root layout ke sini
    - Pertahankan semua CSS variables kawaii pastel (`--color-primary`, `--color-secondary`, dll.)
    - Tambahkan metadata wibu (title, description, og) yang sebelumnya ada di root layout
    - Pastikan layout ini hanya membungkus konten wibu, bukan `<html>/<body>` (sudah ada di root)
    - _Requirements: 3.4, 3.5, 3.6, 5.2, 5.3, 5.6, 6.2_

  - [x] 3.3 Pindahkan halaman utama wibu: `app/page.tsx` → `app/(wibu)/wibu/page.tsx`
    - Salin konten `app/page.tsx` ke `app/(wibu)/wibu/page.tsx`
    - Perbarui semua internal link dari `/username` → `/wibu/username`, `/wiki` → `/wibu/wiki`, dll.
    - Perbarui canonical URL metadata menjadi `https://seberapakamu.id/wibu`
    - Verifikasi import `PublicNavbar`, `PublicFooter`, dan `createServerClient` masih valid
    - _Requirements: 3.1, 3.3, 6.2, 6.3_

  - [x] 3.4 Pindahkan halaman-halaman wibu lainnya ke Route Group baru
    - Salin `app/username/page.tsx` → `app/(wibu)/wibu/username/page.tsx`
    - Salin `app/quiz/page.tsx` → `app/(wibu)/wibu/quiz/page.tsx`
    - Salin `app/result/[hash]/layout.tsx` → `app/(wibu)/wibu/result/[hash]/layout.tsx`
    - Salin `app/result/[hash]/page.tsx` → `app/(wibu)/wibu/result/[hash]/page.tsx`
    - Salin `app/wiki/page.tsx` → `app/(wibu)/wibu/wiki/page.tsx`
    - Salin `app/tentang-wibu/page.tsx` → `app/(wibu)/wibu/tentang-wibu/page.tsx`
    - Salin `app/blog/page.tsx` → `app/(wibu)/wibu/blog/page.tsx`
    - Salin `app/blog/[slug]/page.tsx` → `app/(wibu)/wibu/blog/[slug]/page.tsx`
    - Perbarui semua internal link di setiap file agar menggunakan prefix `/wibu/`
    - _Requirements: 3.1, 3.3_

  - [x] 3.5 Perbarui `components/PublicNav.tsx` — tambah link "Kembali ke Hub"
    - Perbarui konstanta `NAV_LINKS` dan `FOOTER_LINKS` agar semua href menggunakan prefix `/wibu/` (contoh: `/wiki` → `/wibu/wiki`)
    - Perbarui href logo dari `/` tetap ke `/` (mengarah ke hub)
    - Tambahkan link "← Hub" atau "🏠 Kembali ke Hub" yang mengarah ke `/` di navbar desktop dan sidebar mobile
    - Pastikan link "Mulai Kuis" mengarah ke `/wibu/username`
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 3.6 Hapus file-file lama setelah verifikasi Route Group baru berfungsi
    - Hapus `app/page.tsx` (sudah dipindah ke `app/(wibu)/wibu/page.tsx`)
    - Hapus `app/username/page.tsx`
    - Hapus `app/quiz/page.tsx`
    - Hapus `app/result/[hash]/layout.tsx` dan `app/result/[hash]/page.tsx`
    - Hapus `app/wiki/page.tsx`
    - Hapus `app/tentang-wibu/page.tsx`
    - Hapus `app/blog/page.tsx` dan `app/blog/[slug]/page.tsx`
    - ⚠️ Lakukan ini HANYA setelah memverifikasi semua halaman baru dapat diakses
    - _Requirements: 3.3_

- [x] 4. Checkpoint — Verifikasi refactor wibu
  - Pastikan semua route `/wibu/*` dapat dirender tanpa error
  - Pastikan `app/layout.tsx` sudah minimal (tidak ada font/CSS wibu)
  - Pastikan `app/(wibu)/wibu/layout.tsx` memuat globals.css dan font Nunito
  - Tanyakan ke user jika ada pertanyaan sebelum melanjutkan ke fase hub.

- [x] 5. Buat komponen hub
  - [x] 5.1 Buat `components/hub/ModuleCard.tsx`
    - Buat direktori `components/hub/`
    - Implementasikan komponen `ModuleCard` yang menerima prop `module: Module`
    - Tampilkan: `mascotEmoji` (besar, di atas), `name` (bold, warna terang), `description` (muted), badge `category`
    - Bungkus seluruh card dengan `<Link href={module.href}>` dari `next/link`
    - Terapkan styling dark card: background `#1A1A2E`, border berwarna `module.accentColor`, glow effect pada hover
    - Tambahkan atribut aksesibilitas: `aria-label` yang deskriptif, `tabIndex={0}`, focus ring visible
    - Jika `mascotEmoji` adalah path gambar (bukan emoji), render sebagai `<img>` dengan `alt={module.mascotAlt}`
    - _Requirements: 1.1, 1.4, 2.2, 2.3, 2.5, 9.3, 9.4, 9.7_

  - [x] 5.2 Buat `components/hub/ComingSoonCard.tsx`
    - Implementasikan komponen `ComingSoonCard` yang menerima prop `module: Module`
    - Tampilkan: `mascotEmoji` (grayscale), `name`, label "Segera Hadir"
    - Render sebagai `<div>` (bukan `<Link>`) — tidak ada navigasi
    - Terapkan styling: `opacity: 0.5`, `filter: grayscale(100%)` pada maskot, `border: 2px dashed`
    - Tambahkan atribut aksesibilitas: `aria-disabled="true"`, tidak ada `tabIndex`, `role="img"` pada maskot jika emoji
    - Pastikan `pointer-events: none` atau tidak ada handler klik
    - _Requirements: 1.5, 2.4, 9.3, 9.4_

- [x] 6. Buat Route Group hub dan hub landing page
  - [x] 6.1 Buat `app/(hub)/layout.tsx` — layout hub
    - Buat direktori `app/(hub)/`
    - Implementasikan `HubLayout` dengan CSS variables hub di dalam `<style>` tag atau via className
    - Definisikan CSS variables: `--hub-bg: #0F0F1A`, `--hub-bg-card: #1A1A2E`, `--hub-text: #F0F0FF`, `--hub-text-muted: #9090B0`, `--hub-border: #2A2A45`
    - Muat font Nunito dengan weight 800 dan 900 via `next/font/google`
    - Ekspor metadata hub: title "Seberapa Kamu? — Platform Kuis Kepribadian Seru", description, og tags, canonical URL
    - Pastikan layout ini TIDAK mengimpor `globals.css` (isolasi dari tema wibu)
    - _Requirements: 2.1, 5.2, 5.3, 5.4, 6.1, 6.5_

  - [x] 6.2 Buat `app/(hub)/page.tsx` — hub landing page
    - Implementasikan halaman sebagai Server Component dengan `export const dynamic = 'force-static'` (SSG)
    - **Hero Section:** tagline "Seberapa Kamu?" + sub-headline platform, tanpa CTA ke modul spesifik
    - **Module Grid:** import `MODULES` dari `lib/hub/modules.ts`, render `ModuleCard` untuk modul `active` dan `ComingSoonCard` untuk modul `coming_soon` secara dinamis
    - **Hub Navbar minimal:** hanya logo/brand "Seberapa Kamu?" tanpa navigasi tambahan
    - **Footer hub minimal:** copyright, tanpa link navigasi yang panjang
    - Terapkan layout responsif: grid 1 kolom di mobile, 2-3 kolom di desktop
    - Gunakan CSS variables hub (`--hub-bg`, `--hub-text`, dll.) untuk semua styling
    - Tambahkan breadcrumb atau indikator visual "Kamu sedang di: Hub"
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.8, 1.9, 2.5, 4.5, 9.6_

- [x] 7. Checkpoint — Verifikasi hub landing page
  - Pastikan `/` merender hub landing page (bukan halaman wibu)
  - Pastikan `/wibu` merender halaman wibu dengan layout kawaii pastel
  - Pastikan CSS variables hub tidak bocor ke halaman wibu dan sebaliknya
  - Tanyakan ke user jika ada pertanyaan sebelum melanjutkan ke fase testing.

- [x] 8. Tulis property-based tests dan unit tests
  - [x] 8.1 Buat `__tests__/hub/modules-config.test.ts` — validasi konfigurasi modul
    - Install import: `import fc from 'fast-check'`
    - **Property 4:** Tulis PBT yang memverifikasi setiap modul dalam `MODULES` memiliki `accentColor` yang unik (tidak ada duplikat)
    - Tulis unit test: verifikasi `MODULES` mengandung tepat 1 modul dengan status `active` (modul wibu) pada konfigurasi MVP
    - Tulis unit test: verifikasi semua field wajib (`id`, `name`, `slug`, `description`, `accentColor`, `mascotEmoji`, `mascotAlt`, `status`, `href`) ada dan bertipe string
    - _Requirements: 2.2, 10.1_

  - [x] 8.2 Tulis property test untuk konfigurasi modul (Property 4)
    - **Property 4: Setiap modul memiliki accentColor yang unik**
    - **Validates: Requirements 2.2**
    - Gunakan `fc.array(fc.record({...}))` untuk generate daftar modul arbitrary
    - Assert: `new Set(modules.map(m => m.accentColor)).size === modules.length`

  - [x] 8.3 Buat `__tests__/hub/module-card.test.tsx` — tests untuk ModuleCard
    - Setup: render `ModuleCard` dengan modul wibu dari `MODULES`
    - Tulis unit test: verifikasi `mascotEmoji` ditampilkan di DOM
    - Tulis unit test: verifikasi card memiliki elemen `<a>` dengan `href` yang benar
    - Tulis unit test: verifikasi `aria-label` ada dan tidak kosong
    - Tulis unit test: verifikasi `tabIndex={0}` ada pada elemen interaktif
    - _Requirements: 1.4, 2.6, 9.3, 9.4, 9.7_

  - [x] 8.4 Tulis property test untuk ModuleCard (Property 1 dan 5)
    - **Property 1: Setiap modul aktif memiliki card yang dapat diklik**
    - **Validates: Requirements 1.1, 1.4, 10.2, 10.4**
    - **Property 5: Setiap ModuleCard menampilkan maskot modul**
    - **Validates: Requirements 2.6**
    - Gunakan `fc.array(fc.record({status: fc.constant('active'), href: fc.webUrl(), mascotEmoji: fc.string({minLength: 1}), ...}))` untuk generate modul aktif arbitrary
    - Assert Property 1: setiap card yang dirender memiliki `<a href={module.href}>`
    - Assert Property 5: setiap card yang dirender menampilkan `mascotEmoji` di DOM

  - [x] 8.5 Buat `__tests__/hub/coming-soon-card.test.tsx` — tests untuk ComingSoonCard
    - Setup: render `ComingSoonCard` dengan modul bucin dari `MODULES`
    - Tulis unit test: verifikasi tidak ada elemen `<a>` di dalam card
    - Tulis unit test: verifikasi teks "Segera Hadir" ada di DOM
    - Tulis unit test: verifikasi `aria-disabled="true"` ada pada card
    - _Requirements: 1.5, 2.4_

  - [x] 8.6 Tulis property test untuk ComingSoonCard (Property 2)
    - **Property 2: Setiap modul coming_soon memiliki card yang non-interaktif dengan label "Segera Hadir"**
    - **Validates: Requirements 1.5, 2.4, 10.3**
    - Gunakan `fc.record({status: fc.constant('coming_soon'), name: fc.string({minLength: 1}), ...})` untuk generate modul coming_soon arbitrary
    - Assert: tidak ada `<a>` di dalam card yang dirender
    - Assert: teks "Segera Hadir" ada di DOM

  - [x] 8.7 Buat `__tests__/hub/hub-landing.test.tsx` — tests untuk hub landing page
    - Setup: mock `MODULES` dengan kombinasi modul aktif dan coming_soon
    - Tulis unit test: verifikasi tagline platform ada di DOM
    - Tulis unit test: verifikasi minimal 2 `ComingSoonCard` dirender pada konfigurasi MVP
    - Tulis unit test: verifikasi modul wibu dirender sebagai `ModuleCard` (bukan `ComingSoonCard`)
    - _Requirements: 1.2, 1.3, 1.6_

  - [x] 8.8 Tulis property test untuk hub landing (Property 3)
    - **Property 3: Jumlah card yang dirender sama dengan jumlah modul yang dikonfigurasi**
    - **Validates: Requirements 10.2**
    - Gunakan `fc.array(fc.record({status: fc.oneof(fc.constant('active'), fc.constant('coming_soon')), ...}), {minLength: 1, maxLength: 10})` untuk generate daftar modul arbitrary
    - Assert: total card yang dirender (ModuleCard + ComingSoonCard) === `modules.length`

  - [x] 8.9 Buat `__tests__/hub/accessibility.test.tsx` — tests aksesibilitas
    - Render hub landing page dengan semua modul dari `MODULES`
    - Tulis unit test: verifikasi semua elemen `<img>` memiliki atribut `alt` yang tidak kosong
    - Tulis unit test: verifikasi semua `ModuleCard` memiliki `tabIndex={0}` dan `aria-label`
    - Tulis unit test: verifikasi `ComingSoonCard` memiliki `aria-disabled="true"`
    - _Requirements: 9.3, 9.4, 9.7_

  - [x] 8.10 Tulis property test untuk aksesibilitas (Property 6)
    - **Property 6: Semua gambar/maskot memiliki alt text yang tidak kosong**
    - **Validates: Requirements 9.4**
    - Gunakan `fc.array(fc.record({mascotAlt: fc.string({minLength: 1}), ...}))` untuk generate modul arbitrary
    - Assert: setiap elemen `<img>` yang dirender memiliki `alt` yang tidak kosong (`alt !== ''`)

  - [x] 8.11 Buat `__tests__/hub/redirects.test.ts` — tests konfigurasi redirect
    - Import konfigurasi redirect dari `next.config.ts`
    - Definisikan array `EXPECTED_REDIRECTS` dengan 7 pasangan source/destination sesuai spesifikasi
    - Tulis unit test: verifikasi setiap redirect yang diharapkan ada dalam konfigurasi dengan `permanent: true`
    - Tulis unit test: verifikasi tidak ada redirect yang menyentuh prefix `/admin`
    - _Requirements: 3.2, 7.1, 7.2, 7.3, 7.5_

  - [x] 8.12 Tulis property test untuk redirect (Property 7)
    - **Property 7: Konfigurasi redirect mencakup semua pasangan URL lama → URL baru**
    - **Validates: Requirements 3.2, 7.1, 7.2**
    - Gunakan `fc.constantFrom(...EXPECTED_REDIRECTS)` untuk sample dari daftar redirect yang diharapkan
    - Assert: setiap pasangan (source, destination) ada dalam konfigurasi dengan `permanent: true`

  - [x] 8.13 Buat `__tests__/hub/contrast.test.ts` — tests contrast ratio
    - Implementasikan fungsi helper `calculateContrastRatio(hex1: string, hex2: string): number` menggunakan formula WCAG (relative luminance)
    - Definisikan array pasangan warna hub yang perlu diverifikasi: `[{text: '#F0F0FF', bg: '#0F0F1A'}, {text: '#9090B0', bg: '#0F0F1A'}, {text: '#FFFFFF', bg: '#1A1A2E'}, {text: '#F0F0FF', bg: '#1A1A2E'}]`
    - Tulis unit test: verifikasi setiap pasangan memiliki contrast ratio ≥ 4.5:1
    - _Requirements: 9.2_

  - [x] 8.14 Tulis property test untuk contrast ratio (Property 8)
    - **Property 8: Contrast ratio teks hub memenuhi WCAG AA**
    - **Validates: Requirements 9.2**
    - Gunakan `fc.constantFrom(...HUB_COLOR_PAIRS)` untuk sample dari pasangan warna hub
    - Assert: `calculateContrastRatio(pair.text, pair.bg) >= 4.5`

- [x] 9. Checkpoint — Jalankan semua tests
  - Jalankan `npm test -- --testPathPattern="__tests__/hub" --passWithNoTests`
  - Pastikan semua tests lulus tanpa error
  - Tanyakan ke user jika ada pertanyaan atau ada test yang gagal.

- [x] 10. Integrasi akhir dan verifikasi
  - [x] 10.1 Perbarui `app/not-found.tsx` jika diperlukan
    - Verifikasi halaman 404 masih berfungsi dengan benar setelah refactor
    - Pastikan link "Kembali ke Beranda" di halaman 404 mengarah ke `/` (hub)
    - _Requirements: 7.6_

  - [x] 10.2 Buat `app/sitemap.ts` untuk mencakup URL hub dan wibu
    - Buat file `app/sitemap.ts`
    - Sertakan URL statis: `/`, `/wibu`, `/wibu/wiki`, `/wibu/tentang-wibu`, `/wibu/blog`
    - Sertakan URL dinamis `/wibu/blog/[slug]` dari Supabase
    - _Requirements: 6.6_

  - [x] 10.3 Verifikasi admin panel tidak terpengaruh
    - Pastikan `app/admin/layout.tsx` tidak dimodifikasi
    - Pastikan semua route `/admin/*` masih dapat diakses
    - Pastikan tidak ada redirect yang menimpa `/admin/*`
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 11. Checkpoint final — Verifikasi integrasi menyeluruh
  - Pastikan `npm run build` berhasil tanpa error TypeScript
  - Pastikan semua tests lulus: `npm test -- --passWithNoTests`
  - Pastikan struktur direktori sesuai target yang didefinisikan di design.md
  - Tanyakan ke user jika ada pertanyaan sebelum dinyatakan selesai.

---

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk implementasi MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoint memastikan validasi inkremental di setiap fase kritis
- Property tests memvalidasi properti kebenaran universal yang didefinisikan di design.md
- Unit tests memvalidasi contoh spesifik dan edge cases
- **Urutan fase 3 (refactor wibu) sangat penting** — jangan hapus file lama sebelum file baru terverifikasi
- Admin panel (`app/admin/`) dan API routes (`app/api/`) tidak boleh disentuh sama sekali
- `globals.css` tetap di `app/globals.css` (root), hanya diimport dari `app/(wibu)/wibu/layout.tsx`
- fast-check harus diinstall sebelum menulis PBT (task 1.1)
