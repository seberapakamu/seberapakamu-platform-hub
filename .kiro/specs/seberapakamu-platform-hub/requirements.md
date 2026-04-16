# Requirements Document

## Pendahuluan

Platform Hub "Seberapa Kamu?" adalah evolusi arsitektur dari proyek "Seberapa Wibu Kamu?" menjadi platform multi-modul yang dapat menampung berbagai kuis bertema kepribadian/fandom dalam satu domain `seberapakamu.id`. Arsitektur yang dipilih adalah **Route-based Monorepo** — satu Next.js app, satu deployment, dengan Route Groups untuk isolasi layout per modul.

Perubahan utama:
- `/` → Landing page baru sebagai hub semua modul (menggantikan landing page wibu)
- `/wibu/*` → Semua route modul wibu dipindah ke prefix ini
- `/[modul]/*` → Slot untuk modul-modul baru di masa depan
- `/admin/*` → Panel admin tetap di posisi yang sama (shared)

Scope MVP mencakup: landing page hub, refactor route wibu, dan navigasi seamless antar hub dan modul. Modul baru (bucin, introvert, dll) hanya ditampilkan sebagai placeholder "coming soon".

---

## Glossary

- **Platform_Hub**: Sistem website `seberapakamu.id` secara keseluruhan sebagai umbrella brand.
- **Hub_Landing**: Halaman utama di `/` yang menampilkan semua modul sebagai kartu yang bisa diklik.
- **Modul**: Unit kuis mandiri dengan tema, warna, dan karakter/maskot sendiri (contoh: Modul_Wibu, Modul_Bucin).
- **Modul_Wibu**: Modul kuis "Seberapa Wibu Kamu?" yang direfactor ke prefix `/wibu/*`.
- **Route_Group**: Fitur Next.js App Router `(group)` untuk mengisolasi layout per modul tanpa mempengaruhi URL.
- **Modul_Card**: Komponen kartu interaktif di Hub_Landing yang merepresentasikan satu modul.
- **Coming_Soon_Card**: Modul_Card untuk modul yang belum tersedia, ditampilkan dalam kondisi non-aktif.
- **Admin_Panel**: Antarmuka pengelolaan konten dan konfigurasi platform, tetap di `/admin/*`.
- **Pengguna**: Pengunjung website yang menggunakan kuis tanpa perlu login (anonymous).
- **Canonical_URL**: URL resmi yang digunakan untuk SEO dan Open Graph per modul.
- **Redirect_Rule**: Aturan pengalihan URL dari route lama ke route baru.

---

## Requirements

### Requirement 1: Hub Landing Page

**User Story:** Sebagai pengguna baru yang mengunjungi `seberapakamu.id`, saya ingin melihat halaman utama yang menampilkan semua modul kuis yang tersedia, sehingga saya bisa memilih kuis yang ingin saya ikuti.

#### Acceptance Criteria

1. THE Hub_Landing SHALL menampilkan daftar semua modul dalam bentuk Modul_Card yang bisa diklik.
2. THE Hub_Landing SHALL menampilkan Modul_Wibu sebagai satu-satunya modul aktif pada MVP.
3. THE Hub_Landing SHALL menampilkan minimal 2 Coming_Soon_Card sebagai placeholder modul masa depan (contoh: "Seberapa Bucin Kamu?", "Seberapa Introvert Kamu?").
4. WHEN pengguna mengklik Modul_Card yang aktif, THE Hub_Landing SHALL mengarahkan pengguna ke halaman utama modul tersebut (contoh: `/wibu`).
5. WHILE Coming_Soon_Card ditampilkan, THE Hub_Landing SHALL menonaktifkan interaksi klik dan menampilkan label "Segera Hadir" pada kartu tersebut.
6. THE Hub_Landing SHALL menampilkan tagline dan deskripsi singkat Platform_Hub sebagai umbrella brand.
7. THE Hub_Landing SHALL memuat halaman dengan Largest Contentful Paint (LCP) ≤ 1.5 detik.
8. THE Hub_Landing SHALL menampilkan halaman secara responsif pada viewport lebar 320px hingga 1920px.
9. THE Hub_Landing SHALL memiliki identitas visual "Playful & Colorful" yang berbeda dari tema kawaii pastel Modul_Wibu.

---

### Requirement 2: Identitas Visual Hub

**User Story:** Sebagai pengguna, saya ingin merasakan perbedaan visual yang jelas antara Hub_Landing dan halaman modul, sehingga saya tahu saya sedang berada di level "umbrella brand" atau di dalam modul tertentu.

#### Acceptance Criteria

1. THE Hub_Landing SHALL menggunakan palet warna dan tipografi yang berbeda dari palet kawaii pastel Modul_Wibu.
2. THE Hub_Landing SHALL menampilkan setiap Modul_Card dengan warna aksen dan karakter/maskot yang unik per modul.
3. THE Hub_Landing SHALL menampilkan Modul_Card Modul_Wibu dengan warna dan maskot bertema anime/kawaii.
4. THE Hub_Landing SHALL menampilkan Coming_Soon_Card dengan tampilan visual yang jelas berbeda (contoh: grayscale, opacity rendah, atau border dashed) untuk membedakannya dari modul aktif.
5. THE Hub_Landing SHALL menggunakan layout yang menyerupai "game select screen" — kartu modul sebagai pilihan yang bisa dipilih pemain.
6. WHERE modul memiliki karakter/maskot yang ditetapkan, THE Hub_Landing SHALL menampilkan karakter tersebut pada Modul_Card yang bersangkutan.

---

### Requirement 3: Refactor Route Modul Wibu

**User Story:** Sebagai developer, saya ingin semua route modul wibu dipindah ke prefix `/wibu/*`, sehingga arsitektur URL konsisten dengan sistem multi-modul dan modul lain bisa ditambahkan di masa depan.

#### Acceptance Criteria

1. THE Platform_Hub SHALL menyediakan semua halaman Modul_Wibu di bawah prefix `/wibu/` sesuai pemetaan berikut:
   - `/` (lama) → `/wibu` (baru, halaman utama modul wibu)
   - `/username` (lama) → `/wibu/username` (baru)
   - `/quiz` (lama) → `/wibu/quiz` (baru)
   - `/result/[hash]` (lama) → `/wibu/result/[hash]` (baru)
   - `/wiki` (lama) → `/wibu/wiki` (baru)
   - `/tentang-wibu` (lama) → `/wibu/tentang-wibu` (baru)
   - `/blog` (lama) → `/wibu/blog` (baru)
   - `/blog/[slug]` (lama) → `/wibu/blog/[slug]` (baru)
2. WHEN pengguna mengakses URL lama (contoh: `/quiz`), THE Platform_Hub SHALL mengarahkan pengguna ke URL baru yang sesuai (contoh: `/wibu/quiz`) dengan HTTP 301 Permanent Redirect.
3. THE Platform_Hub SHALL mempertahankan semua fungsionalitas Modul_Wibu yang sudah ada setelah refactor route.
4. THE Platform_Hub SHALL menggunakan Route_Group Next.js App Router (contoh: `app/(wibu)/wibu/`) untuk mengisolasi layout Modul_Wibu dari layout Hub_Landing.
5. THE Platform_Hub SHALL memastikan layout Modul_Wibu (navbar, footer, tema kawaii pastel) hanya diterapkan pada halaman di bawah prefix `/wibu/*`.
6. THE Platform_Hub SHALL memastikan layout Hub_Landing hanya diterapkan pada halaman `/` (root).

---

### Requirement 4: Navigasi Seamless Hub ↔ Modul

**User Story:** Sebagai pengguna, saya ingin bisa berpindah antara Hub_Landing dan modul dengan mudah, sehingga pengalaman navigasi terasa mulus dan tidak membingungkan.

#### Acceptance Criteria

1. THE Modul_Wibu SHALL menampilkan tautan "Kembali ke Hub" atau logo Platform_Hub yang mengarahkan pengguna ke `/`.
2. THE Hub_Landing SHALL menampilkan navigasi yang jelas ke setiap modul aktif.
3. WHEN pengguna berada di dalam Modul_Wibu dan mengklik tautan ke Hub_Landing, THE Platform_Hub SHALL mengarahkan ke `/` tanpa kehilangan state kuis yang tersimpan di localStorage.
4. THE Platform_Hub SHALL memastikan navigasi antar halaman dalam satu modul (contoh: `/wibu` → `/wibu/quiz`) tidak melewati Hub_Landing.
5. THE Hub_Landing SHALL menampilkan breadcrumb atau indikator visual yang menunjukkan pengguna sedang di level hub.
6. IF pengguna mengakses URL modul secara langsung (contoh: `/wibu/quiz`), THEN THE Platform_Hub SHALL menampilkan halaman modul tersebut tanpa redirect ke Hub_Landing.

---

### Requirement 5: Isolasi Layout Per Modul

**User Story:** Sebagai developer, saya ingin setiap modul memiliki layout yang terisolasi, sehingga perubahan tema atau navigasi di satu modul tidak mempengaruhi modul lain atau Hub_Landing.

#### Acceptance Criteria

1. THE Platform_Hub SHALL mengimplementasikan Route_Group terpisah untuk setiap modul (contoh: `(wibu)`, `(bucin)`) menggunakan fitur Route Groups Next.js App Router.
2. THE Platform_Hub SHALL mengimplementasikan file `layout.tsx` terpisah untuk Hub_Landing dan setiap modul.
3. THE Platform_Hub SHALL memastikan CSS variables dan tema DaisyUI Modul_Wibu (kawaii pastel) tidak bocor ke halaman Hub_Landing.
4. THE Platform_Hub SHALL memastikan CSS variables dan tema Hub_Landing tidak bocor ke halaman modul manapun.
5. WHEN modul baru ditambahkan di masa depan, THE Platform_Hub SHALL memungkinkan penambahan Route_Group baru tanpa mengubah layout modul yang sudah ada.
6. THE Platform_Hub SHALL memastikan file `globals.css` yang ada tetap berfungsi untuk Modul_Wibu setelah refactor.

---

### Requirement 6: SEO dan Metadata Per Modul

**User Story:** Sebagai pemilik platform, saya ingin setiap modul dan Hub_Landing memiliki metadata SEO yang tepat, sehingga setiap halaman dapat ditemukan dengan baik di mesin pencari.

#### Acceptance Criteria

1. THE Hub_Landing SHALL memiliki metadata SEO unik: `title`, `description`, `og:title`, `og:description`, dan `og:image` yang merepresentasikan Platform_Hub sebagai umbrella brand.
2. THE Modul_Wibu SHALL mempertahankan metadata SEO yang sudah ada setelah refactor route.
3. WHEN URL modul wibu berubah (contoh: `/` menjadi `/wibu`), THE Platform_Hub SHALL memperbarui `canonical` URL pada metadata halaman Modul_Wibu.
4. THE Platform_Hub SHALL memastikan Redirect_Rule dari URL lama ke URL baru tidak menyebabkan duplikasi konten di mesin pencari.
5. THE Hub_Landing SHALL menyertakan `og:image` yang merepresentasikan visual "game select screen" Platform_Hub.
6. THE Platform_Hub SHALL memastikan sitemap mencakup URL Hub_Landing dan semua URL Modul_Wibu yang baru.

---

### Requirement 7: Redirect URL Lama ke URL Baru

**User Story:** Sebagai pengguna yang sudah menyimpan atau membagikan URL lama (contoh: `seberapakamu.id/quiz`), saya ingin URL tersebut tetap berfungsi dan mengarahkan ke halaman yang benar, sehingga link yang sudah tersebar tidak rusak.

#### Acceptance Criteria

1. THE Platform_Hub SHALL mengimplementasikan Redirect_Rule HTTP 301 untuk semua URL lama Modul_Wibu ke URL baru dengan prefix `/wibu/`.
2. THE Platform_Hub SHALL mengimplementasikan Redirect_Rule untuk URL `/result/[hash]` lama ke `/wibu/result/[hash]` baru.
3. THE Platform_Hub SHALL mengimplementasikan Redirect_Rule menggunakan konfigurasi `redirects` di `next.config.ts`.
4. WHEN pengguna mengakses URL lama yang sudah di-redirect, THE Platform_Hub SHALL menampilkan halaman tujuan dengan benar tanpa error.
5. THE Platform_Hub SHALL memastikan Redirect_Rule tidak mempengaruhi route `/admin/*` yang tetap di posisi yang sama.
6. IF URL yang diakses tidak cocok dengan route manapun (termasuk URL lama dan baru), THEN THE Platform_Hub SHALL menampilkan halaman 404 yang sesuai.

---

### Requirement 8: Admin Panel Tetap di `/admin/*`

**User Story:** Sebagai admin, saya ingin panel admin tetap dapat diakses di URL yang sama (`/admin/*`), sehingga workflow admin tidak terganggu oleh perubahan arsitektur.

#### Acceptance Criteria

1. THE Admin_Panel SHALL tetap dapat diakses di semua URL `/admin/*` yang sudah ada tanpa perubahan.
2. THE Admin_Panel SHALL tetap menggunakan layout dan autentikasi yang sudah ada tanpa modifikasi.
3. THE Platform_Hub SHALL memastikan refactor route Modul_Wibu tidak mempengaruhi fungsionalitas Admin_Panel.
4. THE Admin_Panel SHALL dapat mengelola konten untuk semua modul aktif dari satu panel yang sama.
5. WHILE Admin_Panel diakses, THE Platform_Hub SHALL menerapkan layout admin yang terpisah dari layout Hub_Landing maupun layout modul manapun.

---

### Requirement 9: Performa dan Aksesibilitas Hub

**User Story:** Sebagai pengguna, saya ingin Hub_Landing berjalan cepat dan dapat diakses dengan baik di semua perangkat, sehingga pengalaman pertama saya di platform tidak terganggu.

#### Acceptance Criteria

1. THE Hub_Landing SHALL memuat halaman dengan LCP ≤ 1.5 detik pada koneksi 4G.
2. THE Hub_Landing SHALL memastikan rasio kontras warna minimal 4.5:1 untuk semua teks konten.
3. THE Hub_Landing SHALL mendukung navigasi keyboard penuh pada semua elemen interaktif termasuk Modul_Card.
4. THE Hub_Landing SHALL menyediakan teks alternatif (alt text) untuk semua gambar dan karakter/maskot modul.
5. THE Hub_Landing SHALL menampilkan halaman secara responsif pada viewport lebar 320px hingga 1920px.
6. THE Hub_Landing SHALL menggunakan Static Site Generation (SSG) untuk memaksimalkan performa.
7. WHEN Modul_Card difokuskan via keyboard, THE Hub_Landing SHALL menampilkan indikator fokus yang jelas dan terlihat.

---

### Requirement 10: Ekstensibilitas Modul Baru

**User Story:** Sebagai developer, saya ingin arsitektur platform mendukung penambahan modul baru di masa depan dengan mudah, sehingga platform dapat berkembang tanpa refactor besar.

#### Acceptance Criteria

1. THE Platform_Hub SHALL mendefinisikan struktur data modul (nama, slug, deskripsi, warna, maskot, status aktif) yang dapat dikonfigurasi untuk menambah modul baru.
2. THE Hub_Landing SHALL merender Modul_Card secara dinamis berdasarkan daftar modul yang dikonfigurasi.
3. WHEN modul baru ditambahkan ke konfigurasi dengan status "coming_soon", THE Hub_Landing SHALL menampilkan Coming_Soon_Card untuk modul tersebut secara otomatis.
4. WHEN modul baru ditambahkan ke konfigurasi dengan status "active", THE Hub_Landing SHALL menampilkan Modul_Card yang dapat diklik dan mengarahkan ke `/[slug-modul]`.
5. THE Platform_Hub SHALL mendokumentasikan konvensi penamaan Route_Group dan struktur direktori untuk modul baru dalam komentar kode atau README.
6. THE Platform_Hub SHALL memastikan penambahan modul baru tidak memerlukan perubahan pada layout Hub_Landing atau layout modul yang sudah ada.

