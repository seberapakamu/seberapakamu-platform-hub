/**
 * lib/shared/index.ts
 *
 * Single entry point untuk Shared_Module — semua consumer cukup import dari satu path.
 *
 * === Lokasi ===
 * @module @/lib/shared
 *
 * === Cara Penggunaan ===
 * @example
 * import { MODULES, getActiveModules, baseCardStyle } from '@/lib/shared';
 * import type { UnifiedModule, ModuleStatus } from '@/lib/shared';
 *
 * === Cara Menambah Modul Baru ===
 * Tambahkan entri baru ke array `MODULES` di `lib/shared/registry.ts`.
 * Gunakan `status: 'coming_soon'` saat pertama kali, lalu ubah ke `'active'` saat siap.
 * Pastikan `id`, `slug`, dan `accentColor` unik di seluruh array.
 */

// Types & interfaces
export type { UnifiedModule, ModuleStatus } from './types';

// Module registry
export { MODULES } from './registry';

// Helper functions
export { isMascotImage, getModuleBySlug, getActiveModules, getComingSoonModules } from './helpers';

// Style utilities
export { baseCardStyle, getActiveCardStyle, getInactiveCardStyle } from './styles';
