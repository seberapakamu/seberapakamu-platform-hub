# Requirements Document

## Pendahuluan

Fitur **Shared Module Logic** adalah refactoring arsitektur untuk mengekstrak dan menyatukan logic yang saat ini terduplikasi antar modul platform `seberapakamu.id`. Saat ini terdapat dua interface data modul yang terpisah (`Module` di `lib/hub/modules.ts` dan `ModuleConfig` di `lib/modules.config.ts`), dua komponen `ModuleCard` yang berbeda (`components/hub/ModuleCard.tsx` dan `components/ModuleCard.tsx`), serta fungsi helper yang diduplikasi (`isMascotImage`). Refactoring ini menyatukan semua definisi tersebut ke dalam satu sumber kebenaran (single source of truth) yang digunakan bersama oleh Hub Landing, Admin Panel, dan modul-modul di masa depan.

Tujuan utama: kode lebih DRY, lebih mudah di-maintain, dan siap di-scale up ketika modul baru ditambahkan.

---

## Glossary

- **Shared_Module**: Kumpulan tipe, interface, konstanta, dan fungsi yang digunakan bersama oleh lebih dari satu modul platform.
- **Module_Registry**: Satu file konfigurasi tunggal yang menjadi sumber kebenaran untuk semua data modul platform (menggantikan `lib/hub/modules.ts` dan `lib/modules.config.ts`).
- **Unified_Module_Interface**: Interface TypeScript tunggal yang merepresentasikan data modul, menggabungkan field dari `Module` dan `ModuleConfig` yang ada.
- **Shared_Component**: Komponen React yang dapat digunakan oleh lebih dari satu konteks (hub, admin, modul baru) tanpa duplikasi kode.
- **Hub_Adapter**: Lapisan tipis yang mengadaptasi `Unified_Module_Interface` ke kebutuhan spesifik Hub Landing (contoh: field `href`, `mascotAlt`).
- **Admin_Adapter**: Lapisan tipis yang mengadaptasi `Unified_Module_Interface` ke kebutuhan spesifik Admin Panel (contoh: field `reviewCount`).
- **Consumer**: Modul atau komponen yang mengimpor dan menggunakan Shared_Module.
- **Platform**: Sistem website `seberapakamu.id` secara keseluruhan.
- **Module_Status**: Nilai enum `'active' | 'coming_soon'` yang menentukan apakah modul dapat diinteraksi.

---

## Requirements

### Requirement 1: Unified Module Interface

**User Story:** Sebagai developer, saya ingin ada satu interface TypeScript tunggal untuk data modul, sehingga saya tidak perlu menjaga dua definisi yang berbeda tetap sinkron ketika menambah field baru.

#### Acceptance Criteria

1. THE Shared_Module SHALL mendefinisikan satu `Unified_Module_Interface` yang mencakup semua field yang dibutuhkan oleh Hub Landing dan Admin Panel: `id`, `slug`, `name`, `description`, `status`, `emoji`, `accentColor`, `href`, `mascotAlt`, dan `category` (opsional).
2. THE Shared_Module SHALL mendefinisikan `Unified_Module_Interface` di satu file tunggal yang dapat diimpor oleh semua Consumer.
3. THE Shared_Module SHALL mendefinisikan tipe `ModuleStatus` sebagai `'active' | 'coming_soon'` di file yang sama dengan `Unified_Module_Interface`.
4. WHEN field baru ditambahkan ke `Unified_Module_Interface`, THE Shared_Module SHALL memastikan semua Consumer yang menggunakan field tersebut mendapatkan type error dari TypeScript jika field tidak disediakan.
5. THE Shared_Module SHALL memastikan `Unified_Module_Interface` bersifat backward-compatible dengan semua Consumer yang sudah ada (`components/hub/ModuleCard.tsx`, `components/ModuleCard.tsx`, `app/(hub)/page.tsx`, `app/admin/page.tsx`).

---

### Requirement 2: Module Registry — Single Source of Truth

**User Story:** Sebagai developer, saya ingin ada satu file konfigurasi modul yang digunakan oleh seluruh platform, sehingga ketika modul baru ditambahkan, saya hanya perlu mengubah satu tempat.

#### Acceptance Criteria

1. THE Module_Registry SHALL mendefinisikan array `MODULES` tunggal yang berisi semua modul platform dengan tipe `Unified_Module_Interface[]`.
2. THE Module_Registry SHALL menggantikan kedua file konfigurasi yang ada (`lib/hub/modules.ts` dan `lib/modules.config.ts`) sebagai satu-satunya sumber data modul.
3. WHEN `lib/hub/modules.ts` dan `lib/modules.config.ts` dihapus atau dijadikan re-export, THE Platform SHALL memastikan semua Consumer yang sebelumnya mengimpor dari file tersebut tetap berfungsi tanpa error.
4. THE Module_Registry SHALL mendokumentasikan konvensi penambahan modul baru dalam komentar kode, mencakup: lokasi file Route Group, struktur direktori, dan cara mengubah status dari `coming_soon` ke `active`.
5. THE Module_Registry SHALL memastikan setiap modul dalam array `MODULES` memiliki nilai `id` dan `slug` yang unik — tidak ada dua modul dengan `id` atau `slug` yang sama.
6. THE Module_Registry SHALL memastikan setiap modul dalam array `MODULES` memiliki nilai `accentColor` yang unik — tidak ada dua modul dengan warna aksen yang identik.

---

### Requirement 3: Shared Helper Functions

**User Story:** Sebagai developer, saya ingin fungsi-fungsi helper yang digunakan oleh beberapa komponen didefinisikan di satu tempat, sehingga perbaikan bug atau perubahan logika hanya perlu dilakukan sekali.

#### Acceptance Criteria

1. THE Shared_Module SHALL mengekstrak fungsi `isMascotImage` yang saat ini terduplikasi di `components/hub/ModuleCard.tsx` dan `components/hub/ComingSoonCard.tsx` ke dalam satu file shared utility.
2. THE Shared_Module SHALL mengekspor fungsi `isMascotImage` sehingga dapat diimpor oleh semua Consumer yang membutuhkannya.
3. THE Shared_Module SHALL mendefinisikan fungsi `getModuleBySlug(slug: string): Unified_Module_Interface | undefined` yang mencari modul berdasarkan slug dari `Module_Registry`.
4. THE Shared_Module SHALL mendefinisikan fungsi `getActiveModules(): Unified_Module_Interface[]` yang mengembalikan semua modul dengan status `active`.
5. THE Shared_Module SHALL mendefinisikan fungsi `getComingSoonModules(): Unified_Module_Interface[]` yang mengembalikan semua modul dengan status `coming_soon`.
6. WHEN `getModuleBySlug` dipanggil dengan slug yang tidak ada di `Module_Registry`, THE Shared_Module SHALL mengembalikan `undefined` tanpa melempar exception.

---

### Requirement 4: Shared Base Card Styles

**User Story:** Sebagai developer, saya ingin style dasar kartu modul (padding, border-radius, background, transisi) didefinisikan di satu tempat, sehingga tampilan kartu konsisten di seluruh platform dan perubahan desain hanya perlu dilakukan sekali.

#### Acceptance Criteria

1. THE Shared_Module SHALL mendefinisikan konstanta atau fungsi yang menghasilkan `baseCardStyle` (padding, border-radius, background, transition, display, flexDirection) yang digunakan bersama oleh `ModuleCard` hub, `ModuleCard` admin, dan `ComingSoonCard`.
2. THE Shared_Module SHALL mendefinisikan konstanta atau fungsi yang menghasilkan style untuk kartu aktif (border solid dengan `accentColor`, cursor pointer) yang dapat digunakan oleh semua Consumer.
3. THE Shared_Module SHALL mendefinisikan konstanta atau fungsi yang menghasilkan style untuk kartu non-aktif (border dashed, opacity rendah, pointer-events none) yang dapat digunakan oleh semua Consumer.
4. WHEN Consumer menggunakan shared base styles, THE Shared_Module SHALL memungkinkan Consumer untuk meng-override style individual tanpa harus menduplikasi seluruh objek style.
5. THE Shared_Module SHALL memastikan shared base styles tidak mengandung nilai warna yang spesifik untuk satu konteks (hub atau admin) — warna yang berbeda per konteks harus dioper sebagai parameter.

---

### Requirement 5: Backward Compatibility dan Migrasi Consumer

**User Story:** Sebagai developer, saya ingin proses migrasi ke Shared_Module tidak merusak fungsionalitas yang sudah berjalan, sehingga refactoring dapat dilakukan secara bertahap tanpa downtime.

#### Acceptance Criteria

1. THE Platform SHALL memastikan semua halaman yang sudah ada (`app/(hub)/page.tsx`, `app/admin/page.tsx`, `app/admin/wibu/page.tsx`) tetap berfungsi setelah migrasi ke Shared_Module.
2. THE Platform SHALL memastikan semua komponen yang sudah ada (`components/hub/ModuleCard.tsx`, `components/hub/ComingSoonCard.tsx`, `components/ModuleCard.tsx`) tetap merender output yang sama secara visual setelah migrasi.
3. IF file lama (`lib/hub/modules.ts` atau `lib/modules.config.ts`) dipertahankan sebagai re-export, THEN THE Platform SHALL memastikan re-export tersebut mengekspor tipe dan nilai yang identik dengan yang diharapkan Consumer lama.
4. THE Platform SHALL memastikan tidak ada TypeScript error baru yang muncul di Consumer yang sudah ada setelah migrasi ke Shared_Module.
5. THE Platform SHALL memastikan semua test yang sudah ada tetap lulus setelah migrasi ke Shared_Module.

---

### Requirement 6: Struktur Direktori Shared Module

**User Story:** Sebagai developer, saya ingin Shared_Module ditempatkan di lokasi direktori yang intuitif dan konsisten dengan konvensi proyek, sehingga mudah ditemukan dan diimpor oleh Consumer baru.

#### Acceptance Criteria

1. THE Shared_Module SHALL ditempatkan di direktori `lib/shared/` atau `lib/modules/` — bukan di dalam direktori yang spesifik untuk satu modul (contoh: bukan di `lib/hub/`).
2. THE Shared_Module SHALL mengekspor semua tipe, interface, konstanta, dan fungsi melalui satu file index (`index.ts`) sehingga Consumer dapat mengimpor dari satu path.
3. THE Shared_Module SHALL menggunakan path alias yang sudah ada di proyek (contoh: `@/lib/shared`) untuk semua import internal.
4. THE Platform SHALL mendokumentasikan lokasi Shared_Module dan cara menggunakannya dalam komentar kode di file index Shared_Module.
5. WHEN modul baru ditambahkan ke platform di masa depan, THE Shared_Module SHALL memungkinkan penambahan tersebut hanya dengan menambahkan entri ke `Module_Registry` tanpa mengubah struktur direktori Shared_Module.

---

### Requirement 7: Type Safety dan Validasi

**User Story:** Sebagai developer, saya ingin Shared_Module memberikan type safety yang kuat, sehingga kesalahan konfigurasi modul terdeteksi saat compile time, bukan saat runtime.

#### Acceptance Criteria

1. THE Shared_Module SHALL menggunakan TypeScript strict mode untuk semua file di dalamnya.
2. THE Shared_Module SHALL memastikan array `MODULES` di Module_Registry bertipe `Unified_Module_Interface[]` secara eksplisit, sehingga TypeScript memvalidasi setiap entri modul saat compile time.
3. THE Shared_Module SHALL memastikan field wajib (`id`, `slug`, `name`, `description`, `status`, `emoji`, `accentColor`, `href`, `mascotAlt`) tidak dapat dihilangkan dari entri modul tanpa menyebabkan TypeScript error.
4. THE Shared_Module SHALL memastikan field `status` hanya dapat bernilai `'active'` atau `'coming_soon'` — nilai lain harus menyebabkan TypeScript error.
5. IF Consumer mencoba mengakses field yang tidak ada di `Unified_Module_Interface`, THEN TypeScript SHALL menampilkan error pada saat compile time.

---

### Requirement 8: Performa dan Bundle Size

**User Story:** Sebagai developer, saya ingin Shared_Module tidak menambah bundle size yang tidak perlu, sehingga performa platform tidak terdegradasi setelah refactoring.

#### Acceptance Criteria

1. THE Shared_Module SHALL menggunakan tree-shakeable exports sehingga Consumer hanya membundle kode yang benar-benar digunakan.
2. THE Shared_Module SHALL memastikan Module_Registry (`MODULES` array) hanya diimpor di Server Components atau di file yang tidak masuk ke client bundle secara tidak perlu.
3. THE Shared_Module SHALL tidak mengimpor library eksternal yang besar — semua fungsi helper harus menggunakan JavaScript/TypeScript native.
4. THE Platform SHALL memastikan ukuran bundle halaman Hub Landing (`app/(hub)/page.tsx`) tidak bertambah lebih dari 5% setelah migrasi ke Shared_Module.
5. THE Platform SHALL memastikan ukuran bundle halaman Admin Module Selector (`app/admin/page.tsx`) tidak bertambah lebih dari 5% setelah migrasi ke Shared_Module.
