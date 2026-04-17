# Implementation Plan: Admin Module Selector

## Overview

Implementasi fitur Admin Module Selector dengan membangun konfigurasi modul statis, komponen kartu, halaman selector, layout panel, memindahkan halaman admin yang sudah ada ke prefix `/admin/wibu/`, dan memperbarui semua link internal serta redirect kompatibilitas.

## Tasks

- [x] 1. Buat konfigurasi modul statis
  - Buat file `lib/modules.config.ts`
  - Definisikan interface `ModuleConfig` dengan field: `slug`, `name`, `description`, `emoji`, `color`, `status`
  - Export array `MODULES` dengan tiga modul: `wibu` (active), `bucin` (coming_soon), `introvert` (coming_soon)
  - _Requirements: 7.1, 7.2, 1.6_

- [ ] 2. Buat komponen ModuleCard
  - [x] 2.1 Implementasi komponen `components/ModuleCard.tsx`
    - Terima props `module: ModuleConfig` dan `reviewCount?: number`
    - Untuk `status: 'active'`: render sebagai `<Link href="/admin/${module.slug}">` yang bisa diklik
    - Untuk `status: 'coming_soon'`: render sebagai div disabled dengan label "Belum Tersedia" dan `pointer-events: none`
    - Tampilkan `emoji`, `name`, `description`, dan badge `reviewCount` jika > 0
    - Terapkan warna identitas modul dari `module.color`
    - _Requirements: 1.3, 1.4, 1.5, 6.2, 6.5_

  - [x] 2.2 Tulis property test untuk ModuleCard — Property 2
    - **Property 2: Module Card menampilkan data modul dengan benar**
    - Gunakan `fast-check` dengan `moduleConfigArb` sesuai design
    - Verifikasi output mengandung `name`, `description`, `emoji`, dan indikator status
    - **Validates: Requirements 1.3, 6.2**

  - [x] 2.3 Tulis property test untuk ModuleCard — Property 3
    - **Property 3: Active module card menghasilkan URL navigasi yang benar**
    - Gunakan `activeModuleArb` dan verifikasi href = `/admin/${module.slug}`
    - **Validates: Requirements 1.4, 2.1**

  - [x] 2.4 Tulis property test untuk ModuleCard — Property 4
    - **Property 4: Inactive module card selalu disabled dan berlabel "Belum Tersedia"**
    - Gunakan `inactiveModuleArb`, verifikasi elemen tidak dapat diklik dan teks "Belum Tersedia" muncul
    - **Validates: Requirements 1.5, 7.4**

- [-] 3. Buat halaman Module Selector
  - [x] 3.1 Buat `app/admin/page.tsx` sebagai server component
    - Panggil `createServerClient()` → `getUser()` → `redirect('/admin/login')` jika user null
    - Render grid `MODULES.map(module => <ModuleCard module={module} />)`
    - Sertakan header dengan email admin dan `AdminLogoutButton`
    - Gunakan gaya visual konsisten dengan panel admin yang sudah ada
    - _Requirements: 1.1, 1.2, 1.7, 4.1, 6.1, 6.4_

  - [x] 3.2 Tulis property test untuk Module Selector — Property 1
    - **Property 1: Module Selector merender semua modul yang dikonfigurasi**
    - Gunakan `moduleListArb`, verifikasi jumlah ModuleCard = jumlah modul dalam array
    - **Validates: Requirements 1.2, 7.2**

  - [x] 3.3 Tulis example-based test: auth guard Module Selector
    - Verifikasi `app/admin/page.tsx` memanggil `redirect('/admin/login')` ketika `getUser()` returns null
    - _Requirements: 1.7, 4.1_

- [-] 4. Pindahkan halaman admin ke `/admin/wibu/` dan buat layout Wibu Panel
  - [x] 4.1 Pindahkan file-file admin ke prefix `/admin/wibu/`
    - `app/admin/dashboard/page.tsx` → `app/admin/wibu/page.tsx`
    - `app/admin/questions/page.tsx` → `app/admin/wibu/questions/page.tsx`
    - `app/admin/content/page.tsx` → `app/admin/wibu/content/page.tsx`
    - `app/admin/site-content/page.tsx` → `app/admin/wibu/site-content/page.tsx`
    - _Requirements: 5.1, 5.3_

  - [x] 4.2 Buat `app/admin/wibu/layout.tsx` — Wibu Panel Layout
    - Tampilkan header dengan nama modul aktif ("🌸 Seberapa Wibu Kamu?")
    - Sertakan link "← Pilih Modul" dengan `href="/admin"`
    - Render nav horizontal: Dashboard · Pertanyaan · Konten Blog · Edit Halaman
    - Render shortcut ke panel modul aktif lain dari `MODULES.filter(m => m.status === 'active')`
    - Sertakan `AdminLogoutButton`
    - _Requirements: 2.3, 3.1, 3.3, 3.4, 6.1_

  - [x] 4.3 Tulis property test untuk Wibu Panel Layout — Property 5
    - **Property 5: Panel layout menampilkan nama modul aktif**
    - Verifikasi output mengandung `module.name` di area header/navigasi
    - **Validates: Requirements 2.3, 3.3**

  - [x] 4.4 Tulis property test untuk Wibu Panel Layout — Property 6
    - **Property 6: Panel layout selalu menyertakan link kembali ke Module Selector**
    - Verifikasi setiap halaman dalam panel merender elemen dengan `href="/admin"`
    - **Validates: Requirements 3.1**

  - [x] 4.5 Tulis property test untuk Wibu Panel Layout — Property 7
    - **Property 7: Panel layout merender shortcut ke semua modul aktif**
    - Gunakan `moduleListArb`, verifikasi ada link ke setiap modul dengan `status: 'active'`
    - **Validates: Requirements 3.4, 3.5**

- [x] 5. Update internal links di halaman yang dipindah
  - Di `app/admin/wibu/page.tsx` (ex-dashboard): update semua `href` NAV_LINKS dari `/admin/questions`, `/admin/content`, `/admin/site-content` ke `/admin/wibu/questions`, `/admin/wibu/content`, `/admin/wibu/site-content`
  - Di seluruh halaman wibu: ganti teks/link "← Dashboard" atau `href="/admin/dashboard"` menjadi `href="/admin/wibu"` atau "← Pilih Modul" ke `/admin`
  - _Requirements: 5.3_

- [x] 6. Update redirect setelah login di `app/admin/login/page.tsx`
  - Ganti satu baris: `router.push('/admin/dashboard')` → `router.push('/admin')`
  - _Requirements: 1.1, 5.4_

  - [x] 6.1 Tulis example-based test: login redirect ke `/admin`
    - Verifikasi setelah `signInWithPassword` berhasil, `router.push` dipanggil dengan `/admin`
    - _Requirements: 1.1_

- [x] 7. Tambah redirect rules backward compatibility di `next.config.ts`
  - Tambahkan 4 entri permanent redirect (308):
    - `/admin/dashboard` → `/admin/wibu`
    - `/admin/questions` → `/admin/wibu/questions`
    - `/admin/content` → `/admin/wibu/content`
    - `/admin/site-content` → `/admin/wibu/site-content`
  - _Requirements: 5.2_

  - [x] 7.1 Tulis example-based test: verifikasi konfigurasi redirect
    - Verifikasi `next.config.ts` memiliki keempat mapping redirect dari URL lama ke URL baru
    - _Requirements: 5.2_

- [x] 8. Checkpoint — Pastikan semua tests pass
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 9. Buat handler untuk slug tidak dikenal
  - [x] 9.1 Buat `app/admin/[slug]/page.tsx`
    - Cek apakah `params.slug` ada di `MODULES`
    - Jika tidak ditemukan: panggil `notFound()` (return 404)
    - Jika ditemukan tapi `status: 'coming_soon'`: panggil `redirect('/admin?info=coming-soon')`
    - Jika ditemukan dan `status: 'active'`: arahkan ke panel yang sesuai (atau bisa jadi `notFound()` jika belum ada halaman)
    - _Requirements: 2.4, 2.5, 4.5_

  - [x] 9.2 Tulis example-based test: akses slug tidak dikenal mengembalikan 404
    - Verifikasi `notFound()` dipanggil untuk slug yang tidak ada di `MODULES`
    - _Requirements: 2.4_

  - [x] 9.3 Tulis example-based test: verifikasi konfigurasi `MODULES` default
    - Verifikasi `MODULES` array mengandung modul dengan `slug: 'wibu'` dan `status: 'active'`
    - _Requirements: 1.6, 7.1_

- [x] 10. Final checkpoint — Pastikan semua tests pass
  - Pastikan semua tests pass dan tidak ada regresi fungsionalitas di halaman yang dipindah, tanyakan ke user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Data modul adalah konfigurasi statis di `lib/modules.config.ts`, bukan tabel database
- Property tests menggunakan `fast-check` dengan minimum 100 iterasi per property
- Semua property tests dijalankan dengan React Testing Library + jsdom
- Redirect di `next.config.ts` menggunakan status 308 (permanent redirect)
- Auth tetap menggunakan mekanisme Supabase yang sudah ada tanpa modifikasi
