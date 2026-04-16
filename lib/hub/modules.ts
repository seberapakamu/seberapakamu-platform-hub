/**
 * lib/hub/modules.ts
 *
 * Konfigurasi modul untuk Platform Hub "Seberapa Kamu?"
 *
 * === Konvensi Penamaan Route Group untuk Modul Baru ===
 * Setiap modul baru harus mengikuti pola berikut:
 *
 * 1. Route Group: `app/([slug-modul])/[slug-modul]/`
 *    Contoh: `app/(bucin)/bucin/`
 *
 * 2. Layout modul: `app/([slug-modul])/[slug-modul]/layout.tsx`
 *    - Definisikan CSS variables dan tema unik modul di sini
 *    - Import font dan globals CSS modul di sini
 *    - JANGAN import globals.css wibu di layout modul lain
 *
 * 3. Tambahkan entri baru ke array MODULES di bawah dengan:
 *    - `status: 'coming_soon'` saat pertama kali ditambahkan
 *    - `status: 'active'` setelah modul siap diluncurkan
 *
 * 4. Tambahkan redirect rules di `next.config.ts` jika diperlukan
 */

export type ModuleStatus = "active" | "coming_soon";

export interface Module {
  /** Unique identifier, e.g. "wibu" */
  id: string;
  /** Display name, e.g. "Seberapa Wibu Kamu?" */
  name: string;
  /** URL slug, e.g. "wibu" — digunakan sebagai prefix route */
  slug: string;
  /** Short description untuk ditampilkan di card */
  description: string;
  /** Hex color unik per modul, e.g. "#FF9A9E" — harus unik antar modul */
  accentColor: string;
  /** Emoji atau path ke gambar maskot, e.g. "🌸" atau "/images/mascot-wibu.png" */
  mascotEmoji: string;
  /** Alt text untuk aksesibilitas — wajib tidak kosong */
  mascotAlt: string;
  /** Status modul: 'active' = dapat diklik, 'coming_soon' = non-interaktif */
  status: ModuleStatus;
  /** URL tujuan saat card diklik, e.g. "/wibu" */
  href: string;
  /** Kategori opsional untuk badge di card, e.g. "Anime & Manga" */
  category?: string;
}

/**
 * Daftar semua modul yang terdaftar di Platform Hub.
 *
 * Urutan array menentukan urutan tampilan di Hub Landing.
 * Modul dengan status 'active' dirender sebagai ModuleCard (dapat diklik).
 * Modul dengan status 'coming_soon' dirender sebagai ComingSoonCard (non-interaktif).
 */
export const MODULES: Module[] = [
  {
    id: "wibu",
    name: "Seberapa Wibu Kamu?",
    slug: "wibu",
    description:
      "Uji tingkat kewibuan kamu! Dari casual watcher sampai sepuh wibu — kamu ada di level mana?",
    accentColor: "#FF9A9E", // Pastel pink — tema anime/kawaii
    mascotEmoji: "🌸",
    mascotAlt: "Bunga sakura — maskot modul wibu",
    status: "active",
    href: "/wibu",
    category: "Anime & Manga",
  },
  {
    id: "bucin",
    name: "Seberapa Bucin Kamu?",
    slug: "bucin",
    description:
      "Seberapa dalam kamu jatuh cinta? Tes level bucin-mu sekarang!",
    accentColor: "#FF6B9D", // Hot pink — tema romance
    mascotEmoji: "💘",
    mascotAlt: "Panah cinta — maskot modul bucin",
    status: "coming_soon",
    href: "/bucin",
    category: "Relationship",
  },
  {
    id: "introvert",
    name: "Seberapa Introvert Kamu?",
    slug: "introvert",
    description:
      "Introvert sejati atau ambivert? Temukan kepribadian sosialmu!",
    accentColor: "#7C3AED", // Purple — tema introspeksi
    mascotEmoji: "🌙",
    mascotAlt: "Bulan — maskot modul introvert",
    status: "coming_soon",
    href: "/introvert",
    category: "Kepribadian",
  },
];
