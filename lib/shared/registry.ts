/**
 * lib/shared/registry.ts
 *
 * Module Registry — Single Source of Truth untuk semua modul platform.
 *
 * === Konvensi Penambahan Modul Baru ===
 *
 * 1. Tambahkan entri baru ke array MODULES di bawah:
 *    - Gunakan `status: 'coming_soon'` saat pertama kali ditambahkan
 *    - Pilih `accentColor` hex yang belum digunakan modul lain
 *    - Pastikan `id` dan `slug` unik di seluruh array
 *
 * 2. Buat Route Group di: `app/([slug-modul])/[slug-modul]/`
 *    Contoh: `app/(bucin)/bucin/`
 *
 * 3. Struktur direktori modul baru:
 *    app/([slug])/[slug]/
 *    ├── layout.tsx   ← CSS variables, tema, dan font unik modul
 *    └── page.tsx     ← Halaman utama modul
 *
 * 4. Ubah status ke `'active'` saat modul siap diluncurkan.
 *
 * 5. Tambahkan redirect rules di `next.config.ts` jika diperlukan.
 *
 * File ini menggantikan `lib/hub/modules.ts` dan `lib/modules.config.ts`
 * sebagai satu-satunya sumber data modul. Kedua file lama dijadikan
 * re-export tipis untuk backward compatibility.
 */

import type { UnifiedModule } from './types';

/**
 * Daftar semua modul yang terdaftar di platform seberapakamu.id.
 *
 * Urutan array menentukan urutan tampilan di Hub Landing.
 * Modul `'active'` dirender sebagai ModuleCard (dapat diklik).
 * Modul `'coming_soon'` dirender sebagai ComingSoonCard (non-interaktif).
 *
 * Invariants yang harus selalu terpenuhi:
 * - Setiap `id` unik
 * - Setiap `slug` unik
 * - Setiap `accentColor` unik
 */
export const MODULES: UnifiedModule[] = [
  {
    id: 'wibu',
    slug: 'wibu',
    name: 'Seberapa Wibu Kamu?',
    description:
      'Uji tingkat kewibuan kamu! Dari casual watcher sampai sepuh wibu — kamu ada di level mana?',
    status: 'active',
    mascotEmoji: '🌸',
    mascotAlt: 'Bunga sakura — maskot modul wibu',
    accentColor: '#FF9A9E', // Pastel pink — tema anime/kawaii
    href: '/wibu',
    category: 'Anime & Manga',
  },
  {
    id: 'bucin',
    slug: 'bucin',
    name: 'Seberapa Bucin Kamu?',
    description: 'Seberapa dalam kamu jatuh cinta? Tes level bucin-mu sekarang!',
    status: 'coming_soon',
    mascotEmoji: '💘',
    mascotAlt: 'Panah cinta — maskot modul bucin',
    accentColor: '#FF6B9D', // Hot pink — tema romance
    href: '/bucin',
    category: 'Relationship',
  },
  {
    id: 'introvert',
    slug: 'introvert',
    name: 'Seberapa Introvert Kamu?',
    description: 'Introvert sejati atau ambivert? Temukan kepribadian sosialmu!',
    status: 'coming_soon',
    mascotEmoji: '🌙',
    mascotAlt: 'Bulan — maskot modul introvert',
    accentColor: '#7C3AED', // Purple — tema introspeksi
    href: '/introvert',
    category: 'Kepribadian',
  },
];
