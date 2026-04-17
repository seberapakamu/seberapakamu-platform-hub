/**
 * lib/shared/helpers.ts
 *
 * Helper functions untuk Shared_Module.
 * Semua fungsi di sini adalah pure functions tanpa side effects.
 *
 * @see lib/shared/index.ts untuk cara mengimpor dari satu path
 */

import { MODULES } from './registry';
import type { UnifiedModule } from './types';

/**
 * Menentukan apakah nilai `mascot` adalah path gambar (bukan emoji).
 *
 * Path gambar dikenali jika:
 * - Dimulai dengan `/` (absolute path), atau
 * - Mengandung `.` (ekstensi file, e.g. `.png`, `.svg`)
 *
 * String kosong selalu mengembalikan `false`.
 *
 * @example
 * isMascotImage('🌸')              // false
 * isMascotImage('/images/cat.png') // true
 * isMascotImage('mascot.png')      // true
 * isMascotImage('')                // false
 */
export function isMascotImage(mascot: string): boolean {
  if (!mascot) return false;
  return mascot.startsWith('/') || mascot.includes('.');
}

/**
 * Mencari modul berdasarkan slug.
 *
 * Mengembalikan `undefined` jika slug tidak ditemukan — tidak melempar exception.
 * Consumer bertanggung jawab untuk menangani `undefined`, misalnya redirect ke 404.
 *
 * @example
 * getModuleBySlug('wibu')    // returns UnifiedModule { id: 'wibu', ... }
 * getModuleBySlug('unknown') // returns undefined
 */
export function getModuleBySlug(slug: string): UnifiedModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

/**
 * Mengembalikan semua modul dengan status `'active'`.
 *
 * Urutan mengikuti urutan array `MODULES` di registry.
 */
export function getActiveModules(): UnifiedModule[] {
  return MODULES.filter((m) => m.status === 'active');
}

/**
 * Mengembalikan semua modul dengan status `'coming_soon'`.
 *
 * Urutan mengikuti urutan array `MODULES` di registry.
 */
export function getComingSoonModules(): UnifiedModule[] {
  return MODULES.filter((m) => m.status === 'coming_soon');
}
