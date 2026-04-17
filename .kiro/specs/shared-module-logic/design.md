# Design Document: Shared Module Logic

## Overview

Fitur ini adalah refactoring arsitektur untuk mengekstrak dan menyatukan semua logic modul yang saat ini terduplikasi di `seberapakamu.id`. Saat ini ada dua interface (`Module` vs `ModuleConfig`), dua array `MODULES`, dua komponen `ModuleCard`, dan fungsi `isMascotImage` yang didefinisikan dua kali.

Solusinya adalah membuat direktori `lib/shared/` sebagai **single source of truth** — satu interface, satu registry, satu set helper functions, dan shared style constants. File lama dijadikan re-export tipis agar backward-compatible selama migrasi.

### Tujuan

- Eliminasi duplikasi kode (DRY)
- Type safety yang kuat via TypeScript strict mode
- Mudah di-scale: modul baru cukup tambah satu entri di registry
- Zero breaking changes untuk consumer yang sudah ada

---

## Architecture

```mermaid
graph TD
    subgraph "lib/shared/ (Single Source of Truth)"
        A[types.ts<br/>Unified_Module_Interface<br/>ModuleStatus]
        B[registry.ts<br/>MODULES array]
        C[helpers.ts<br/>isMascotImage<br/>getModuleBySlug<br/>getActiveModules<br/>getComingSoonModules]
        D[styles.ts<br/>baseCardStyle<br/>activeCardStyle<br/>inactiveCardStyle]
        E[index.ts<br/>re-export semua]
    end

    subgraph "Legacy Files (re-export only)"
        F[lib/hub/modules.ts]
        G[lib/modules.config.ts]
    end

    subgraph "Consumers"
        H[app/(hub)/page.tsx]
        I[app/admin/page.tsx]
        J[components/hub/ModuleCard.tsx]
        K[components/hub/ComingSoonCard.tsx]
        L[components/ModuleCard.tsx]
    end

    A --> B
    A --> C
    A --> D
    B --> C
    B --> E
    A --> E
    C --> E
    D --> E

    E --> F
    E --> G

    F --> H
    F --> J
    F --> K
    G --> I
    G --> L

    E --> H
    E --> I
    E --> J
    E --> K
    E --> L
```

### Keputusan Arsitektur

**Mengapa `lib/shared/` bukan `lib/modules/`?**
Nama `shared` lebih eksplisit bahwa ini adalah kode yang digunakan bersama lintas konteks. `lib/modules/` bisa ambigu dengan direktori modul individual.

**Mengapa file lama dijadikan re-export, bukan langsung dihapus?**
Migrasi bertahap lebih aman. Re-export memastikan tidak ada breaking change selama transisi. File lama bisa dihapus di PR terpisah setelah semua consumer dimigrasi.

**Mengapa styles sebagai fungsi, bukan konstanta murni?**
Style kartu aktif membutuhkan `accentColor` sebagai parameter (berbeda per modul). Fungsi memungkinkan parameterisasi tanpa duplikasi.

---

## Components and Interfaces

### `lib/shared/types.ts`

```typescript
export type ModuleStatus = 'active' | 'coming_soon';

export interface UnifiedModule {
  /** Unique identifier, e.g. "wibu" */
  id: string;
  /** URL slug, e.g. "wibu" */
  slug: string;
  /** Display name */
  name: string;
  /** Short description untuk card */
  description: string;
  /** Status modul */
  status: ModuleStatus;
  /** Emoji atau path ke gambar maskot */
  mascotEmoji: string;
  /** Alt text untuk aksesibilitas */
  mascotAlt: string;
  /** Hex color unik per modul */
  accentColor: string;
  /** URL tujuan saat card diklik */
  href: string;
  /** Kategori opsional untuk badge */
  category?: string;
}
```

**Catatan field mapping dari interface lama:**
| `Module` (hub) | `ModuleConfig` (admin) | `UnifiedModule` |
|---|---|---|
| `mascotEmoji` | `emoji` | `mascotEmoji` |
| `accentColor` | `color` | `accentColor` |
| `id` | *(tidak ada)* | `id` |
| `href` | *(tidak ada)* | `href` |
| `mascotAlt` | *(tidak ada)* | `mascotAlt` |
| *(tidak ada)* | *(tidak ada)* | `category?` |

### `lib/shared/registry.ts`

```typescript
import type { UnifiedModule } from './types';

export const MODULES: UnifiedModule[] = [
  // ... entri modul
];
```

### `lib/shared/helpers.ts`

```typescript
import { MODULES } from './registry';
import type { UnifiedModule } from './types';

/** Menentukan apakah mascot adalah path gambar (bukan emoji) */
export function isMascotImage(mascot: string): boolean

/** Mencari modul berdasarkan slug. Mengembalikan undefined jika tidak ditemukan. */
export function getModuleBySlug(slug: string): UnifiedModule | undefined

/** Mengembalikan semua modul dengan status 'active' */
export function getActiveModules(): UnifiedModule[]

/** Mengembalikan semua modul dengan status 'coming_soon' */
export function getComingSoonModules(): UnifiedModule[]
```

### `lib/shared/styles.ts`

```typescript
import type React from 'react';

/** Style dasar yang digunakan oleh semua varian card */
export const baseCardStyle: React.CSSProperties

/** Style untuk card aktif — membutuhkan accentColor sebagai parameter */
export function getActiveCardStyle(accentColor: string): React.CSSProperties

/** Style untuk card non-aktif (coming soon) — membutuhkan accentColor sebagai parameter */
export function getInactiveCardStyle(accentColor: string): React.CSSProperties
```

### `lib/shared/index.ts`

```typescript
// Single entry point untuk semua consumer
export type { UnifiedModule, ModuleStatus } from './types';
export { MODULES } from './registry';
export { isMascotImage, getModuleBySlug, getActiveModules, getComingSoonModules } from './helpers';
export { baseCardStyle, getActiveCardStyle, getInactiveCardStyle } from './styles';
```

### Legacy Re-exports

**`lib/hub/modules.ts`** (setelah migrasi):
```typescript
// Re-export untuk backward compatibility
export type { UnifiedModule as Module, ModuleStatus } from '@/lib/shared';
export { MODULES } from '@/lib/shared';
```

**`lib/modules.config.ts`** (setelah migrasi):
```typescript
// Re-export untuk backward compatibility
// ModuleConfig di-alias ke UnifiedModule
export type { UnifiedModule as ModuleConfig } from '@/lib/shared';
export { MODULES } from '@/lib/shared';
```

---

## Data Models

### UnifiedModule — Field Detail

| Field | Type | Required | Keterangan |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier, lowercase, no spaces |
| `slug` | `string` | ✅ | URL slug, sama dengan `id` untuk modul saat ini |
| `name` | `string` | ✅ | Display name lengkap |
| `description` | `string` | ✅ | Deskripsi singkat untuk card |
| `status` | `ModuleStatus` | ✅ | `'active'` atau `'coming_soon'` |
| `mascotEmoji` | `string` | ✅ | Emoji string atau path gambar (`/images/...`) |
| `mascotAlt` | `string` | ✅ | Alt text aksesibilitas, tidak boleh kosong |
| `accentColor` | `string` | ✅ | Hex color unik, e.g. `"#FF9A9E"` |
| `href` | `string` | ✅ | URL tujuan, e.g. `"/wibu"` |
| `category` | `string` | ❌ | Badge kategori opsional |

### Invariants

- `id` unik di seluruh array `MODULES`
- `slug` unik di seluruh array `MODULES`
- `accentColor` unik di seluruh array `MODULES`
- `mascotAlt` tidak boleh string kosong
- `href` harus dimulai dengan `/`

### Konvensi Penambahan Modul Baru

```
1. Tambahkan entri ke MODULES di lib/shared/registry.ts
   - Gunakan status: 'coming_soon' saat pertama kali
   - Pilih accentColor yang belum digunakan modul lain

2. Buat Route Group: app/([slug])/[slug]/
   - layout.tsx: CSS variables dan tema modul
   - page.tsx: halaman utama modul

3. Ubah status ke 'active' saat modul siap diluncurkan
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: MODULES entries conform to UnifiedModule interface

*For any* entry in the `MODULES` array, all required fields (`id`, `slug`, `name`, `description`, `status`, `emoji`, `accentColor`, `href`, `mascotAlt`) must be present and non-empty strings, and `status` must be either `'active'` or `'coming_soon'`.

**Validates: Requirements 2.1, 7.2, 7.3, 7.4**

### Property 2: MODULES uniqueness invariant

*For any* two distinct entries in the `MODULES` array, their `id`, `slug`, and `accentColor` values must all be pairwise distinct — no two modules share the same `id`, `slug`, or `accentColor`.

**Validates: Requirements 2.5, 2.6**

### Property 3: getModuleBySlug round-trip

*For any* module in `MODULES`, calling `getModuleBySlug(module.slug)` must return that exact module. *For any* string that is not a slug of any module in `MODULES`, `getModuleBySlug` must return `undefined`.

**Validates: Requirements 3.3, 3.6**

### Property 4: getActiveModules filter correctness

*For any* call to `getActiveModules()`, every returned module must have `status === 'active'`, and every module in `MODULES` with `status === 'active'` must appear in the result — no active module is omitted.

**Validates: Requirements 3.4**

### Property 5: getComingSoonModules filter correctness

*For any* call to `getComingSoonModules()`, every returned module must have `status === 'coming_soon'`, and every module in `MODULES` with `status === 'coming_soon'` must appear in the result — no coming-soon module is omitted.

**Validates: Requirements 3.5**

### Property 6: baseCardStyle contains required CSS properties

*For any* call to `baseCardStyle`, the returned object must contain all required layout properties: `display`, `flexDirection`, `alignItems`, `textAlign`, `padding`, `borderRadius`, `background`, and `transition`.

**Validates: Requirements 4.1**

---

## Error Handling

### `getModuleBySlug` — slug tidak ditemukan
Mengembalikan `undefined` (bukan throw). Consumer bertanggung jawab untuk handle `undefined`, misalnya dengan redirect ke 404.

### `isMascotImage` — input kosong
Fungsi murni, tidak throw. String kosong mengembalikan `false` (dianggap bukan path gambar).

### TypeScript compile-time errors
Semua error konfigurasi modul (field hilang, tipe salah) harus terdeteksi saat compile time via TypeScript strict mode. Tidak ada runtime validation yang diperlukan untuk data statis.

### Re-export compatibility
Jika ada consumer yang menggunakan field `emoji` (dari `ModuleConfig` lama) atau `color` (dari `ModuleConfig` lama), re-export di `lib/modules.config.ts` perlu memetakan field tersebut. Ini ditangani dengan type alias di re-export layer.

---

## Testing Strategy

### Pendekatan

Fitur ini adalah refactoring kode statis (TypeScript types, pure functions, konstanta). Sebagian besar kebenaran dijamin oleh TypeScript compiler. Testing fokus pada:

1. **Unit tests** — verifikasi behavior fungsi helper dengan contoh konkret
2. **Property-based tests** — verifikasi invariant yang harus berlaku untuk semua input
3. **Compilation check** — TypeScript strict mode sebagai smoke test utama

### Property-Based Testing

Library: **fast-check** (sudah umum di ekosistem TypeScript/Node.js)

Konfigurasi: minimum 100 iterasi per property test.

Tag format: `// Feature: shared-module-logic, Property N: <property_text>`

**Property 1 — MODULES entries conform to interface:**
```typescript
// Feature: shared-module-logic, Property 1: MODULES entries conform to UnifiedModule interface
it('every MODULES entry has all required fields', () => {
  fc.assert(fc.property(fc.constantFrom(...MODULES), (module) => {
    expect(module.id).toBeTruthy();
    expect(module.slug).toBeTruthy();
    expect(module.name).toBeTruthy();
    expect(module.description).toBeTruthy();
    expect(['active', 'coming_soon']).toContain(module.status);
    expect(module.mascotEmoji).toBeTruthy();
    expect(module.mascotAlt).toBeTruthy();
    expect(module.accentColor).toBeTruthy();
    expect(module.href).toBeTruthy();
  }), { numRuns: 100 });
});
```

**Property 2 — Uniqueness invariant:**
```typescript
// Feature: shared-module-logic, Property 2: MODULES uniqueness invariant
it('MODULES has unique id, slug, and accentColor', () => {
  const ids = MODULES.map(m => m.id);
  const slugs = MODULES.map(m => m.slug);
  const colors = MODULES.map(m => m.accentColor);
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(new Set(colors).size).toBe(colors.length);
});
```

**Property 3 — getModuleBySlug round-trip:**
```typescript
// Feature: shared-module-logic, Property 3: getModuleBySlug round-trip
it('getModuleBySlug returns correct module for valid slug', () => {
  fc.assert(fc.property(fc.constantFrom(...MODULES), (module) => {
    expect(getModuleBySlug(module.slug)).toEqual(module);
  }), { numRuns: 100 });
});

it('getModuleBySlug returns undefined for unknown slug', () => {
  fc.assert(fc.property(
    fc.string().filter(s => !MODULES.some(m => m.slug === s)),
    (unknownSlug) => {
      expect(getModuleBySlug(unknownSlug)).toBeUndefined();
    }
  ), { numRuns: 100 });
});
```

**Property 4 — getActiveModules filter correctness:**
```typescript
// Feature: shared-module-logic, Property 4: getActiveModules filter correctness
it('getActiveModules returns only active modules and includes all active modules', () => {
  const result = getActiveModules();
  result.forEach(m => expect(m.status).toBe('active'));
  const allActive = MODULES.filter(m => m.status === 'active');
  expect(result).toHaveLength(allActive.length);
});
```

**Property 5 — getComingSoonModules filter correctness:**
```typescript
// Feature: shared-module-logic, Property 5: getComingSoonModules filter correctness
it('getComingSoonModules returns only coming_soon modules and includes all of them', () => {
  const result = getComingSoonModules();
  result.forEach(m => expect(m.status).toBe('coming_soon'));
  const allComingSoon = MODULES.filter(m => m.status === 'coming_soon');
  expect(result).toHaveLength(allComingSoon.length);
});
```

**Property 6 — baseCardStyle contains required CSS properties:**
```typescript
// Feature: shared-module-logic, Property 6: baseCardStyle contains required CSS properties
it('baseCardStyle contains all required layout properties', () => {
  const style = baseCardStyle;
  expect(style).toHaveProperty('display');
  expect(style).toHaveProperty('flexDirection');
  expect(style).toHaveProperty('alignItems');
  expect(style).toHaveProperty('padding');
  expect(style).toHaveProperty('borderRadius');
  expect(style).toHaveProperty('background');
  expect(style).toHaveProperty('transition');
});
```

### Unit Tests (Example-Based)

- `isMascotImage('🌸')` → `false`
- `isMascotImage('/images/mascot.png')` → `true`
- `isMascotImage('mascot.png')` → `true`
- `isMascotImage('')` → `false`
- `getActiveCardStyle('#FF9A9E')` menghasilkan object dengan `border` yang mengandung `#FF9A9E`
- `getInactiveCardStyle('#FF9A9E')` menghasilkan object dengan `opacity < 1` dan `pointerEvents: 'none'`

### Integration / Smoke Tests

- TypeScript compilation (`tsc --noEmit`) tidak menghasilkan error setelah migrasi
- Semua existing tests di `__tests__/` tetap lulus
- Consumer files (`app/(hub)/page.tsx`, `app/admin/page.tsx`) compile tanpa error

### File Test

`__tests__/lib/shared/shared-module-logic.test.ts`
