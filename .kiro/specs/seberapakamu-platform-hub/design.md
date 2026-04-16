# Design Document — Platform Hub "Seberapa Kamu?"

**Feature Name:** `seberapakamu-platform-hub`
**Workflow:** Requirements-First
**Versi:** 1.0
**Last Updated:** 2026

---

## Overview

Platform Hub "Seberapa Kamu?" adalah evolusi arsitektur dari aplikasi single-modul "Seberapa Wibu Kamu?" menjadi platform multi-modul yang dapat menampung berbagai kuis bertema kepribadian/fandom. Semua modul hidup dalam satu Next.js app, satu deployment, dengan Route Groups untuk isolasi layout per modul.

### Tujuan Utama

- Membuat Hub Landing page di `/` sebagai "game select screen" umbrella brand
- Merefactor semua route modul wibu ke prefix `/wibu/*`
- Mengisolasi layout hub dan layout wibu menggunakan Next.js Route Groups
- Menyediakan fondasi arsitektur yang mudah diperluas untuk modul baru

### Keputusan Arsitektur Kunci

**Route-based Monorepo** dipilih karena:
- Satu deployment, satu codebase — operasional lebih sederhana
- Shared infrastructure (Supabase, API routes, admin panel) tanpa duplikasi
- Next.js Route Groups memberikan isolasi layout yang bersih tanpa mempengaruhi URL
- Tidak perlu subdomain atau multi-repo yang menambah kompleksitas

---

## Architecture

### Struktur Direktori Target

```
app/
├── (hub)/                          # Route Group Hub — URL: /
│   ├── layout.tsx                  # Layout hub (tema playful & colorful)
│   └── page.tsx                    # Hub Landing page
├── (wibu)/                         # Route Group Wibu — URL: /wibu/*
│   └── wibu/
│       ├── layout.tsx              # Layout wibu (kawaii pastel, existing)
│       ├── page.tsx                # /wibu — landing modul wibu
│       ├── username/page.tsx       # /wibu/username
│       ├── quiz/page.tsx           # /wibu/quiz
│       ├── result/[hash]/
│       │   ├── layout.tsx          # /wibu/result/[hash] layout
│       │   └── page.tsx            # /wibu/result/[hash]
│       ├── wiki/page.tsx           # /wibu/wiki
│       ├── tentang-wibu/page.tsx   # /wibu/tentang-wibu
│       └── blog/
│           ├── page.tsx            # /wibu/blog
│           └── [slug]/page.tsx     # /wibu/blog/[slug]
├── admin/                          # Admin panel (tidak berubah)
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── content/page.tsx
│   ├── questions/page.tsx
│   └── site-content/page.tsx
├── api/                            # API routes (tidak berubah)
│   └── ...
├── layout.tsx                      # Root layout — MINIMAL (hanya html/body)
├── globals.css                     # Global CSS (dipertahankan untuk wibu)
└── not-found.tsx
```

### Diagram Alur Routing

```mermaid
graph TD
    A[Request masuk] --> B{Cocok dengan route?}
    B -->|/| C[app/(hub)/page.tsx]
    B -->|/wibu/*| D[app/(wibu)/wibu/...]
    B -->|/admin/*| E[app/admin/...]
    B -->|URL lama /quiz, /wiki, dll| F[next.config.ts redirects]
    F -->|301 Permanent| D
    B -->|Tidak cocok| G[not-found.tsx]

    C --> H[Hub Layout - Playful & Colorful]
    D --> I[Wibu Layout - Kawaii Pastel]
    E --> J[Admin Layout - Existing]
```

### Isolasi Layout

```mermaid
graph LR
    subgraph "Root Layout (minimal)"
        RL[html + body]
    end
    subgraph "Hub Route Group (hub)"
        HL[Hub Layout] --> HP[Hub Landing /]
    end
    subgraph "Wibu Route Group (wibu)"
        WL[Wibu Layout] --> WP[/wibu/*]
    end
    subgraph "Admin"
        AL[Admin Layout] --> AP[/admin/*]
    end
    RL --> HL
    RL --> WL
    RL --> AL
```

---

## Components and Interfaces

### 1. Root Layout (Minimal)

`app/layout.tsx` diubah menjadi wrapper minimal — hanya menyediakan `<html>` dan `<body>` tanpa font, CSS variables, atau tema spesifik modul.

```tsx
// app/layout.tsx — MINIMAL
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

Font Nunito dan `globals.css` dipindahkan ke `app/(wibu)/wibu/layout.tsx` agar hanya berlaku untuk modul wibu.

### 2. Hub Layout

`app/(hub)/layout.tsx` — layout khusus hub dengan tema playful & colorful.

**Tanggung jawab:**
- Mendefinisikan CSS variables hub (terpisah dari wibu)
- Memuat font hub (Nunito ExtraBold atau font berbeda)
- Menyediakan navbar hub minimal dan footer hub
- Tidak menggunakan DaisyUI cupcake theme

```tsx
// app/(hub)/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  variable: "--font-hub",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Seberapa Kamu? — Platform Kuis Kepribadian",
  description: "Temukan berbagai kuis kepribadian seru! Seberapa wibu, bucin, atau introvert kamu?",
  // ... og metadata
};

export default function HubLayout({ children }) {
  return (
    <div className={`hub-root ${nunito.variable}`}>
      <style>{`/* CSS variables hub */`}</style>
      {children}
    </div>
  );
}
```

### 3. Komponen ModuleCard

`components/hub/ModuleCard.tsx` — kartu modul aktif yang dapat diklik.

```tsx
interface ModuleCardProps {
  module: Module;
}

// Menampilkan: maskot/emoji, nama modul, deskripsi singkat, badge status
// Interaktif: Link ke module.href
// Styling: border/shadow dengan warna module.accentColor
// Aksesibilitas: role="link", aria-label, tabIndex, focus ring
```

**Visual spec:**
- Background: dark card dengan border berwarna `accentColor`
- Glow effect pada hover menggunakan `accentColor`
- Maskot/emoji ditampilkan besar di bagian atas card
- Nama modul: font bold, warna putih/terang
- Deskripsi: font regular, warna muted
- Badge "Aktif" atau kategori modul

### 4. Komponen ComingSoonCard

`components/hub/ComingSoonCard.tsx` — kartu modul belum tersedia.

```tsx
interface ComingSoonCardProps {
  module: Module; // status: 'coming_soon'
}

// Menampilkan: maskot grayscale, nama modul, label "Segera Hadir"
// Non-interaktif: tidak ada Link, pointer-events: none
// Styling: opacity 50%, grayscale filter, border dashed
// Aksesibilitas: aria-disabled="true", tidak ada tabIndex
```

### 5. Hub Landing Page

`app/(hub)/page.tsx` — halaman utama platform.

**Sections:**
1. **Hero Section** — tagline platform, sub-headline, tidak ada CTA ke modul spesifik
2. **Module Grid** — grid kartu modul (ModuleCard + ComingSoonCard)
3. **Footer Hub** — minimal, link ke admin (tersembunyi), copyright

### 6. Hub Navbar (Minimal)

Navbar hub sangat minimal — hanya logo/brand "Seberapa Kamu?" tanpa navigasi tambahan karena hub sendiri adalah halaman navigasi.

### 7. Wibu Layout (Diperbarui)

`app/(wibu)/wibu/layout.tsx` — layout wibu yang sudah ada, dipindahkan ke Route Group baru.

**Perubahan:**
- Memuat `globals.css` (dipindahkan dari root layout)
- Memuat font Nunito (dipindahkan dari root layout)
- Menambahkan link "Kembali ke Hub" di navbar wibu yang sudah ada
- Semua CSS variables kawaii pastel tetap di sini

---

## Data Models

### Interface Module

```typescript
// lib/hub/modules.ts

export type ModuleStatus = 'active' | 'coming_soon';

export interface Module {
  id: string;           // Unique identifier, e.g. "wibu"
  name: string;         // Display name, e.g. "Seberapa Wibu Kamu?"
  slug: string;         // URL slug, e.g. "wibu"
  description: string;  // Short description untuk card
  accentColor: string;  // Hex color unik per modul, e.g. "#FF9A9E"
  mascotEmoji: string;  // Emoji atau path ke gambar maskot
  mascotAlt: string;    // Alt text untuk aksesibilitas
  status: ModuleStatus;
  href: string;         // URL tujuan, e.g. "/wibu"
  category?: string;    // Kategori opsional, e.g. "Anime & Manga"
}
```

### Konfigurasi Modul Default (MVP)

```typescript
// lib/hub/modules.ts

export const MODULES: Module[] = [
  {
    id: "wibu",
    name: "Seberapa Wibu Kamu?",
    slug: "wibu",
    description: "Uji tingkat kewibuan kamu! Dari casual watcher sampai sepuh wibu — kamu ada di level mana?",
    accentColor: "#FF9A9E",       // Pastel pink — tema anime/kawaii
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
    description: "Seberapa dalam kamu jatuh cinta? Tes level bucin-mu sekarang!",
    accentColor: "#FF6B9D",       // Hot pink — tema romance
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
    description: "Introvert sejati atau ambivert? Temukan kepribadian sosialmu!",
    accentColor: "#7C3AED",       // Purple — tema introspeksi
    mascotEmoji: "🌙",
    mascotAlt: "Bulan — maskot modul introvert",
    status: "coming_soon",
    href: "/introvert",
    category: "Kepribadian",
  },
];
```

### Redirect Rules

```typescript
// next.config.ts — konfigurasi redirects

const redirects = [
  // Halaman utama wibu (lama: /) sudah digantikan oleh hub
  // Route-route wibu lama → prefix /wibu/
  { source: "/username",          destination: "/wibu/username",          permanent: true },
  { source: "/quiz",              destination: "/wibu/quiz",              permanent: true },
  { source: "/result/:hash",      destination: "/wibu/result/:hash",      permanent: true },
  { source: "/wiki",              destination: "/wibu/wiki",              permanent: true },
  { source: "/tentang-wibu",      destination: "/wibu/tentang-wibu",      permanent: true },
  { source: "/blog",              destination: "/wibu/blog",              permanent: true },
  { source: "/blog/:slug",        destination: "/wibu/blog/:slug",        permanent: true },
];
```

---

## Color System

### Hub Color Palette — "Playful & Colorful"

Berbeda dari kawaii pastel wibu, hub menggunakan dark background dengan aksen vibrant multi-warna.

```css
/* CSS variables hub — didefinisikan di app/(hub)/layout.tsx */
:root {
  /* Background — deep dark untuk kontras tinggi */
  --hub-bg:           #0F0F1A;   /* Deep dark navy */
  --hub-bg-card:      #1A1A2E;   /* Card background */
  --hub-bg-card-hover:#1E1E38;   /* Card hover state */

  /* Text */
  --hub-text:         #F0F0FF;   /* Near white dengan tint biru */
  --hub-text-muted:   #9090B0;   /* Muted purple-gray */
  --hub-text-bold:    #FFFFFF;   /* Pure white untuk heading */

  /* Border & Divider */
  --hub-border:       #2A2A45;   /* Subtle border */
  --hub-border-glow:  rgba(255, 255, 255, 0.1); /* Glow border */

  /* Accent per modul — digunakan via inline style */
  /* Wibu:     #FF9A9E (pastel pink) */
  /* Bucin:    #FF6B9D (hot pink) */
  /* Introvert:#7C3AED (purple) */
  /* Default:  #6366F1 (indigo) */
}
```

### Perbandingan Tema Hub vs Wibu

| Aspek | Hub (Playful & Colorful) | Wibu (Kawaii Pastel) |
|---|---|---|
| Background | `#0F0F1A` (deep dark) | `#FFF5F7` (blush white) |
| Text utama | `#F0F0FF` (near white) | `#4A4A6A` (soft purple-gray) |
| Aksen | Multi-warna vibrant per modul | `#FF9A9E` pastel pink |
| Card | Dark dengan colored border | White dengan pink border |
| Vibe | Game select screen, bold | Kawaii, soft, warm |
| DaisyUI | Tidak digunakan | `cupcake` theme |

### Contrast Ratio Compliance (WCAG AA)

Semua pasangan warna teks/background di hub harus memenuhi rasio kontras minimal 4.5:1:

| Teks | Background | Rasio (estimasi) | Status |
|---|---|---|---|
| `#F0F0FF` | `#0F0F1A` | ~14:1 | ✅ AAA |
| `#9090B0` | `#0F0F1A` | ~5.2:1 | ✅ AA |
| `#FFFFFF` | `#1A1A2E` | ~13:1 | ✅ AAA |
| `#F0F0FF` | `#1A1A2E` | ~12:1 | ✅ AAA |

---

## SEO Metadata

### Hub Landing (`/`)

```typescript
export const metadata: Metadata = {
  title: "Seberapa Kamu? — Platform Kuis Kepribadian Seru",
  description: "Temukan berbagai kuis kepribadian seru di satu tempat! Seberapa wibu, bucin, atau introvert kamu? Mulai kuis gratis sekarang.",
  keywords: ["kuis kepribadian", "seberapa wibu", "kuis online", "tes kepribadian"],
  openGraph: {
    title: "Seberapa Kamu? 🎮",
    description: "Platform kuis kepribadian — pilih kuis favoritmu dan temukan siapa dirimu!",
    type: "website",
    url: "https://seberapakamu.id",
    images: [{ url: "/og/hub.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://seberapakamu.id",
  },
};
```

### Modul Wibu (`/wibu`)

Metadata wibu dipertahankan, hanya canonical URL yang diperbarui:

```typescript
alternates: {
  canonical: "https://seberapakamu.id/wibu",
}
```

### Sitemap

`app/sitemap.ts` diperbarui untuk mencakup:
- `/` — Hub Landing
- `/wibu` — Modul Wibu landing
- `/wibu/wiki`
- `/wibu/tentang-wibu`
- `/wibu/blog`
- `/wibu/blog/[slug]` — dinamis dari Supabase

---

## Correctness Properties

*A property adalah karakteristik atau perilaku yang harus berlaku benar di semua eksekusi valid sistem — pada dasarnya, pernyataan formal tentang apa yang seharusnya dilakukan sistem. Properties berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi mesin.*

### Property 1: Setiap modul aktif memiliki card yang dapat diklik

*Untuk setiap* daftar modul yang mengandung modul dengan status `active`, setiap modul aktif tersebut harus dirender sebagai `ModuleCard` yang memiliki atribut `href` yang mengarah ke `module.href`.

**Validates: Requirements 1.1, 1.4, 10.2, 10.4**

### Property 2: Setiap modul coming_soon memiliki card yang non-interaktif dengan label "Segera Hadir"

*Untuk setiap* modul dengan status `coming_soon`, `ComingSoonCard` yang dirender harus: (a) tidak memiliki elemen `<a>` atau handler klik yang aktif, dan (b) menampilkan teks "Segera Hadir" di dalam card.

**Validates: Requirements 1.5, 2.4, 10.3**

### Property 3: Jumlah card yang dirender sama dengan jumlah modul yang dikonfigurasi

*Untuk setiap* daftar modul dengan kombinasi status apapun, total jumlah card yang dirender di Hub Landing (ModuleCard + ComingSoonCard) harus sama persis dengan panjang daftar modul tersebut.

**Validates: Requirements 10.2**

### Property 4: Setiap modul memiliki accentColor yang unik

*Untuk setiap* daftar modul yang valid, tidak ada dua modul yang memiliki nilai `accentColor` yang sama — setiap modul harus memiliki identitas warna yang unik.

**Validates: Requirements 2.2**

### Property 5: Setiap ModuleCard menampilkan maskot modul

*Untuk setiap* modul dengan `mascotEmoji` yang tidak kosong, `ModuleCard` yang dirender harus menampilkan nilai `mascotEmoji` tersebut di dalam DOM card.

**Validates: Requirements 2.6**

### Property 6: Semua gambar/maskot memiliki alt text yang tidak kosong

*Untuk setiap* modul yang dirender sebagai card (aktif maupun coming_soon), semua elemen `<img>` di dalam card harus memiliki atribut `alt` yang tidak kosong.

**Validates: Requirements 9.4**

### Property 7: Konfigurasi redirect mencakup semua pasangan URL lama → URL baru

*Untuk setiap* pasangan redirect yang didefinisikan dalam spesifikasi (source, destination), konfigurasi `redirects` di `next.config.ts` harus mengandung entri dengan `source` dan `destination` yang sesuai, serta `permanent: true`.

**Validates: Requirements 3.2, 7.1, 7.2**

### Property 8: Contrast ratio teks hub memenuhi WCAG AA

*Untuk setiap* pasangan (warna teks, warna background) yang digunakan di hub, rasio kontras yang dihitung harus ≥ 4.5:1 sesuai standar WCAG AA.

**Validates: Requirements 9.2**

---

## Error Handling

### Kasus Error dan Penanganannya

| Skenario | Penanganan |
|---|---|
| URL lama diakses (e.g. `/quiz`) | Redirect 301 ke `/wibu/quiz` via next.config.ts |
| URL tidak dikenal | `not-found.tsx` menampilkan halaman 404 |
| Konfigurasi modul kosong | Hub Landing menampilkan state kosong dengan pesan informatif |
| Supabase tidak tersedia (hub) | Hub Landing tetap berfungsi — data modul dari konfigurasi statis |
| Gambar maskot gagal dimuat | Fallback ke `mascotEmoji` (emoji teks) |

### Strategi Fallback Modul

Hub Landing menggunakan data modul dari konfigurasi statis (`lib/hub/modules.ts`), bukan dari database. Ini memastikan:
- Hub Landing selalu dapat dirender bahkan jika Supabase down
- Tidak ada loading state di hub
- SSG (Static Site Generation) dapat digunakan penuh

---

## Testing Strategy

### Pendekatan Dual Testing

Strategi pengujian menggunakan dua lapisan yang saling melengkapi:

1. **Unit tests** — contoh spesifik, edge cases, kondisi error
2. **Property-based tests** — properti universal di semua input

### Property-Based Testing

Library yang digunakan: **fast-check** (TypeScript/JavaScript)

Setiap property test dikonfigurasi dengan minimum **100 iterasi** dan diberi tag referensi ke property di design document.

```typescript
// Contoh tag format:
// Feature: seberapakamu-platform-hub, Property 1: Setiap modul aktif memiliki card yang dapat diklik
```

**Property tests yang perlu diimplementasikan:**

| Property | File Test | Deskripsi |
|---|---|---|
| Property 1 | `__tests__/hub/module-card.test.tsx` | ModuleCard aktif memiliki href yang benar |
| Property 2 | `__tests__/hub/coming-soon-card.test.tsx` | ComingSoonCard non-interaktif + label "Segera Hadir" |
| Property 3 | `__tests__/hub/hub-landing.test.tsx` | Jumlah card === jumlah modul |
| Property 4 | `__tests__/hub/modules-config.test.ts` | accentColor unik per modul |
| Property 5 | `__tests__/hub/module-card.test.tsx` | Maskot ditampilkan di card |
| Property 6 | `__tests__/hub/accessibility.test.tsx` | Alt text tidak kosong untuk semua gambar |
| Property 7 | `__tests__/hub/redirects.test.ts` | Konfigurasi redirect lengkap dan benar |
| Property 8 | `__tests__/hub/contrast.test.ts` | Contrast ratio ≥ 4.5:1 |

### Unit Tests

**Unit tests yang perlu diimplementasikan:**

| Test | Deskripsi |
|---|---|
| Hub Landing renders tagline | Verifikasi tagline platform ada di DOM |
| Hub Landing renders ≥ 2 coming soon cards | Verifikasi minimal 2 ComingSoonCard di MVP |
| Wibu module is the only active module (MVP) | Verifikasi hanya wibu yang active di konfigurasi default |
| Hub layout tidak mengandung elemen wibu | Verifikasi isolasi layout |
| Wibu layout tidak mengandung elemen hub | Verifikasi isolasi layout |
| Module data structure is valid | Verifikasi semua field Module ada dan bertipe benar |
| Keyboard navigation on ModuleCard | Verifikasi tabIndex dan focus ring |

### Integration Tests

| Test | Deskripsi |
|---|---|
| `/` renders Hub Landing | Verifikasi halaman hub dapat dirender |
| `/wibu` renders Wibu Landing | Verifikasi halaman wibu dapat dirender setelah refactor |
| Redirect `/quiz` → `/wibu/quiz` | Verifikasi redirect berfungsi di runtime |
| Admin panel tidak terpengaruh | Verifikasi `/admin/*` tetap berfungsi |
