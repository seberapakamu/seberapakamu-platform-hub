# Implementation Plan: Shared Module Logic

## Overview

Refactoring arsitektur untuk mengekstrak dan menyatukan semua logic modul yang terduplikasi ke dalam `lib/shared/` sebagai single source of truth. File lama dijadikan re-export tipis untuk backward compatibility.

## Tasks

- [x] 1. Buat struktur direktori dan file `lib/shared/types.ts`
  - Buat direktori `lib/shared/`
  - Definisikan `ModuleStatus` type sebagai `'active' | 'coming_soon'`
  - Definisikan interface `UnifiedModule` dengan semua field wajib: `id`, `slug`, `name`, `description`, `status`, `mascotEmoji`, `mascotAlt`, `accentColor`, `href`, dan field opsional `category`
  - Pastikan semua field wajib tidak bisa dihilangkan (TypeScript strict mode)
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.3, 7.4_

- [-] 2. Buat `lib/shared/registry.ts` — Module Registry
  - [x] 2.1 Implementasi array `MODULES` bertipe `UnifiedModule[]`
    - Buat file `lib/shared/registry.ts`
    - Definisikan array `MODULES: UnifiedModule[]` dengan data modul yang ada (migrasi dari `lib/hub/modules.ts` dan `lib/modules.config.ts`)
    - Tambahkan komentar konvensi penambahan modul baru (lokasi Route Group, struktur direktori, cara ubah status)
    - Pastikan setiap entri memiliki `id`, `slug`, dan `accentColor` yang unik
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 7.2_

  - [x] 2.2 Write property test: MODULES entries conform to UnifiedModule interface
    - **Property 1: MODULES entries conform to UnifiedModule interface**
    - **Validates: Requirements 2.1, 7.2, 7.3, 7.4**
    - Buat file `__tests__/lib/shared/shared-module-logic.test.ts`
    - Gunakan `fc.constantFrom(...MODULES)` untuk test setiap entri
    - Verifikasi semua required fields truthy dan `status` valid

  - [x] 2.3 Write property test: MODULES uniqueness invariant
    - **Property 2: MODULES uniqueness invariant**
    - **Validates: Requirements 2.5, 2.6**
    - Verifikasi `id`, `slug`, dan `accentColor` unik di seluruh array

- [-] 3. Buat `lib/shared/helpers.ts` — Helper Functions
  - [x] 3.1 Implementasi fungsi `isMascotImage`
    - Ekstrak fungsi `isMascotImage(mascot: string): boolean` dari `components/hub/ModuleCard.tsx` dan `components/hub/ComingSoonCard.tsx`
    - String kosong harus mengembalikan `false`
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Implementasi fungsi `getModuleBySlug`, `getActiveModules`, `getComingSoonModules`
    - Implementasi `getModuleBySlug(slug: string): UnifiedModule | undefined` — return `undefined` jika tidak ditemukan, tidak throw
    - Implementasi `getActiveModules(): UnifiedModule[]`
    - Implementasi `getComingSoonModules(): UnifiedModule[]`
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [x] 3.3 Write property test: getModuleBySlug round-trip
    - **Property 3: getModuleBySlug round-trip**
    - **Validates: Requirements 3.3, 3.6**
    - Test valid slug mengembalikan modul yang tepat
    - Test slug tidak dikenal mengembalikan `undefined`

  - [x] 3.4 Write property test: getActiveModules filter correctness
    - **Property 4: getActiveModules filter correctness**
    - **Validates: Requirements 3.4**
    - Verifikasi semua hasil punya `status === 'active'` dan tidak ada modul aktif yang terlewat

  - [x] 3.5 Write property test: getComingSoonModules filter correctness
    - **Property 5: getComingSoonModules filter correctness**
    - **Validates: Requirements 3.5**
    - Verifikasi semua hasil punya `status === 'coming_soon'` dan tidak ada yang terlewat

  - [x] 3.6 Write unit tests untuk `isMascotImage`
    - `isMascotImage('🌸')` → `false`
    - `isMascotImage('/images/mascot.png')` → `true`
    - `isMascotImage('mascot.png')` → `true`
    - `isMascotImage('')` → `false`
    - _Requirements: 3.1_

- [x] 4. Buat `lib/shared/styles.ts` — Shared Card Styles
  - [x] 4.1 Implementasi `baseCardStyle`, `getActiveCardStyle`, `getInactiveCardStyle`
    - Definisikan `baseCardStyle: React.CSSProperties` dengan properti: `display`, `flexDirection`, `alignItems`, `textAlign`, `padding`, `borderRadius`, `background`, `transition`
    - Implementasi `getActiveCardStyle(accentColor: string): React.CSSProperties` — border solid dengan `accentColor`, cursor pointer
    - Implementasi `getInactiveCardStyle(accentColor: string): React.CSSProperties` — border dashed, opacity rendah, `pointerEvents: 'none'`
    - Tidak ada warna hardcoded yang spesifik untuk satu konteks
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Write property test: baseCardStyle contains required CSS properties
    - **Property 6: baseCardStyle contains required CSS properties**
    - **Validates: Requirements 4.1**
    - Verifikasi semua required layout properties ada di objek

  - [x] 4.3 Write unit tests untuk style functions
    - `getActiveCardStyle('#FF9A9E')` menghasilkan object dengan `border` yang mengandung `#FF9A9E`
    - `getInactiveCardStyle('#FF9A9E')` menghasilkan object dengan `opacity < 1` dan `pointerEvents: 'none'`
    - _Requirements: 4.2, 4.3_

- [x] 5. Checkpoint — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan ke user jika ada pertanyaan.

- [x] 6. Buat `lib/shared/index.ts` — Entry Point
  - Buat file `lib/shared/index.ts` sebagai single entry point
  - Re-export semua tipe, interface, konstanta, dan fungsi dari `types.ts`, `registry.ts`, `helpers.ts`, `styles.ts`
  - Tambahkan komentar dokumentasi lokasi Shared_Module dan cara penggunaannya
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 7. Migrasi legacy files ke re-export
  - [x] 7.1 Update `lib/hub/modules.ts` menjadi re-export
    - Ganti isi file dengan re-export dari `@/lib/shared`
    - Alias `UnifiedModule` sebagai `Module` untuk backward compatibility
    - Ekspor `MODULES` dan `ModuleStatus`
    - _Requirements: 2.2, 2.3, 5.3_

  - [x] 7.2 Update `lib/modules.config.ts` menjadi re-export
    - Ganti isi file dengan re-export dari `@/lib/shared`
    - Alias `UnifiedModule` sebagai `ModuleConfig` untuk backward compatibility
    - Ekspor `MODULES`
    - _Requirements: 2.2, 2.3, 5.3_

- [x] 8. Migrasi Consumer — hapus duplikasi `isMascotImage`
  - [x] 8.1 Update `components/hub/ModuleCard.tsx`
    - Hapus definisi lokal `isMascotImage`
    - Import `isMascotImage` dari `@/lib/shared`
    - Import `baseCardStyle`, `getActiveCardStyle` dari `@/lib/shared` jika digunakan
    - _Requirements: 3.1, 3.2, 5.1, 5.2_

  - [x] 8.2 Update `components/hub/ComingSoonCard.tsx`
    - Hapus definisi lokal `isMascotImage`
    - Import `isMascotImage` dari `@/lib/shared`
    - Import `baseCardStyle`, `getInactiveCardStyle` dari `@/lib/shared` jika digunakan
    - _Requirements: 3.1, 3.2, 5.1, 5.2_

  - [x] 8.3 Update `components/ModuleCard.tsx`
    - Import tipe dan helper dari `@/lib/shared` atau via re-export `lib/modules.config.ts`
    - Pastikan tidak ada TypeScript error baru
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 9. Verifikasi Consumer pages tidak ada breaking change
  - [x] 9.1 Verifikasi `app/(hub)/page.tsx`
    - Pastikan import dari `lib/hub/modules.ts` masih berfungsi via re-export
    - Tidak ada TypeScript error baru
    - _Requirements: 5.1, 5.4_

  - [x] 9.2 Verifikasi `app/admin/page.tsx`
    - Pastikan import dari `lib/modules.config.ts` masih berfungsi via re-export
    - Tidak ada TypeScript error baru
    - _Requirements: 5.1, 5.4_

- [x] 10. Final checkpoint — Pastikan semua tests lulus dan TypeScript bersih
  - Jalankan `tsc --noEmit` dan pastikan tidak ada error
  - Pastikan semua existing tests di `__tests__/` tetap lulus
  - Pastikan semua tests baru lulus
  - Tanyakan ke user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoint memastikan validasi inkremental
- Property tests memvalidasi invariant kebenaran universal
- Unit tests memvalidasi contoh spesifik dan edge cases
- Design menggunakan TypeScript — semua implementasi dalam TypeScript
