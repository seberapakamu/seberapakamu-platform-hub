# Requirements Document

## Pendahuluan

Fitur **Admin Module Selector** menambahkan lapisan pemilihan modul pada Admin Panel (`/admin/*`) platform `seberapakamu.id`. Saat ini, setelah login, admin langsung masuk ke satu panel generik tanpa konteks modul tertentu. Fitur ini memungkinkan admin memilih modul mana yang ingin dikonfigurasi (contoh: Modul Wibu, Modul Bucin), diarahkan ke panel konfigurasi yang spesifik per modul, dan berpindah antar modul dari dalam panel tanpa harus logout.

Scope fitur ini mencakup: halaman pemilihan modul setelah login, routing panel per modul, navigasi antar modul, dan proteksi akses ke panel modul yang belum aktif/belum tersedia.

---

## Glossary

- **Admin**: Pengguna terautentikasi yang memiliki akses ke Admin_Panel.
- **Admin_Panel**: Antarmuka pengelolaan konten dan konfigurasi platform di `/admin/*`.
- **Module_Selector**: Halaman pemilihan modul yang ditampilkan setelah admin berhasil login, di URL `/admin`.
- **Module_Panel**: Panel konfigurasi/manajemen yang spesifik untuk satu modul, di URL `/admin/[slug-modul]/*`.
- **Modul**: Unit kuis mandiri dengan slug, nama, deskripsi, dan status aktif (contoh: `wibu`, `bucin`, `introvert`).
- **Active_Module**: Modul yang sudah aktif dan tersedia untuk dikonfigurasi melalui Admin_Panel.
- **Inactive_Module**: Modul yang terdaftar namun belum aktif, ditampilkan sebagai opsi non-interaktif di Module_Selector.
- **Module_Card**: Komponen kartu di Module_Selector yang merepresentasikan satu modul beserta status dan aksi navigasinya.
- **Sesi_Admin**: Sesi autentikasi admin yang aktif, disimpan di cookie/session storage.
- **Active_Module_Context**: Informasi modul yang sedang aktif dikonfigurasi oleh admin dalam satu sesi navigasi.

---

## Requirements

### Requirement 1: Halaman Pemilihan Modul Setelah Login

**User Story:** Sebagai admin yang baru saja login, saya ingin melihat daftar modul yang tersedia untuk dikonfigurasi, sehingga saya bisa memilih modul mana yang ingin saya kelola.

#### Acceptance Criteria

1. WHEN admin berhasil login, THE Module_Selector SHALL menampilkan halaman pemilihan modul di URL `/admin`.
2. THE Module_Selector SHALL menampilkan semua modul yang terdaftar di platform dalam bentuk Module_Card.
3. THE Module_Selector SHALL menampilkan nama, deskripsi singkat, dan status (aktif/belum tersedia) pada setiap Module_Card.
4. WHEN admin mengklik Module_Card dengan status aktif, THE Module_Selector SHALL mengarahkan admin ke panel modul tersebut di URL `/admin/[slug-modul]`.
5. WHILE Module_Card berstatus tidak aktif ditampilkan, THE Module_Selector SHALL menonaktifkan interaksi klik dan menampilkan label "Belum Tersedia" pada kartu tersebut.
6. THE Module_Selector SHALL menampilkan minimal modul Wibu sebagai Active_Module pada implementasi awal.
7. IF admin mengakses URL `/admin` tanpa Sesi_Admin yang valid, THEN THE Admin_Panel SHALL mengarahkan admin ke halaman login di `/admin/login`.

---

### Requirement 2: Routing Panel Per Modul

**User Story:** Sebagai admin yang memilih modul tertentu, saya ingin diarahkan ke panel konfigurasi khusus modul tersebut, sehingga saya bisa mengelola konten dan pengaturan modul secara terisolasi.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menyediakan Module_Panel untuk setiap Active_Module di URL `/admin/[slug-modul]` (contoh: `/admin/wibu`).
2. WHEN admin memilih Modul Wibu dari Module_Selector, THE Admin_Panel SHALL menampilkan panel konfigurasi Wibu di URL `/admin/wibu` dengan menu manajemen soal, konten, dan statistik modul wibu.
3. THE Module_Panel SHALL menampilkan nama modul yang sedang aktif secara jelas di bagian header atau navigasi panel.
4. IF admin mencoba mengakses URL `/admin/[slug-modul]` untuk modul yang tidak terdaftar, THEN THE Admin_Panel SHALL menampilkan halaman 404 yang sesuai.
5. IF admin mencoba mengakses URL `/admin/[slug-modul]` untuk Inactive_Module, THEN THE Admin_Panel SHALL mengarahkan admin ke Module_Selector dengan pesan informasi bahwa modul belum tersedia.
6. WHILE admin berada di dalam Module_Panel, THE Admin_Panel SHALL mempertahankan Sesi_Admin yang aktif tanpa memerlukan login ulang.

---

### Requirement 3: Navigasi Antar Modul dari Dalam Panel

**User Story:** Sebagai admin yang sedang mengkonfigurasi satu modul, saya ingin bisa berpindah ke modul lain tanpa harus logout, sehingga workflow pengelolaan multi-modul tidak terganggu.

#### Acceptance Criteria

1. THE Module_Panel SHALL menampilkan elemen navigasi yang memungkinkan admin kembali ke Module_Selector dari halaman mana pun di dalam panel modul.
2. WHEN admin mengklik navigasi kembali ke Module_Selector, THE Admin_Panel SHALL menampilkan Module_Selector tanpa menghapus Sesi_Admin.
3. THE Module_Panel SHALL menampilkan indikator visual yang jelas tentang modul mana yang sedang aktif dikonfigurasi (contoh: nama modul di sidebar atau breadcrumb).
4. THE Module_Panel SHALL menyediakan shortcut navigasi langsung ke panel modul lain yang aktif tanpa harus kembali ke Module_Selector terlebih dahulu.
5. WHEN admin berpindah dari satu Module_Panel ke Module_Panel lain, THE Admin_Panel SHALL memperbarui Active_Module_Context sesuai modul tujuan.
6. THE Admin_Panel SHALL memastikan perpindahan antar modul tidak menyebabkan hilangnya perubahan yang sudah disimpan di modul sebelumnya.

---

### Requirement 4: Proteksi Akses dan Autentikasi

**User Story:** Sebagai admin, saya ingin semua halaman panel modul terlindungi dari akses tidak sah, sehingga konten dan konfigurasi modul aman dari perubahan yang tidak diotorisasi.

#### Acceptance Criteria

1. WHILE admin belum terautentikasi, THE Admin_Panel SHALL menolak akses ke semua URL `/admin/*` termasuk Module_Selector dan setiap Module_Panel, serta mengarahkan ke `/admin/login`.
2. THE Admin_Panel SHALL mempertahankan mekanisme autentikasi yang sudah ada (email/password, sesi 60 menit) tanpa modifikasi pada sistem login.
3. IF Sesi_Admin kedaluwarsa saat admin berada di dalam Module_Panel, THEN THE Admin_Panel SHALL mengarahkan admin ke `/admin/login` dengan parameter redirect ke halaman yang sedang dibuka.
4. WHEN admin berhasil login kembali setelah sesi kedaluwarsa dengan parameter redirect, THE Admin_Panel SHALL mengarahkan admin ke halaman panel yang sebelumnya dibuka.
5. THE Admin_Panel SHALL memastikan URL Module_Panel (`/admin/[slug-modul]/*`) tidak dapat diakses tanpa Sesi_Admin yang valid, meskipun URL diakses langsung via browser.

---

### Requirement 5: Kompatibilitas dengan Panel Admin yang Sudah Ada

**User Story:** Sebagai admin, saya ingin fitur pemilihan modul terintegrasi dengan mulus ke dalam panel admin yang sudah ada, sehingga workflow yang sudah berjalan tidak terganggu.

#### Acceptance Criteria

1. THE Admin_Panel SHALL memindahkan semua halaman admin yang sudah ada (manajemen soal, konten, statistik) ke bawah prefix `/admin/wibu/*` sebagai bagian dari Module_Panel Wibu.
2. THE Admin_Panel SHALL mengimplementasikan redirect dari URL admin lama (contoh: `/admin/questions`) ke URL baru di bawah Module_Panel Wibu (contoh: `/admin/wibu/questions`).
3. THE Admin_Panel SHALL memastikan semua fungsionalitas panel admin yang sudah ada (CRUD soal, CMS, statistik) tetap berfungsi setelah dipindah ke Module_Panel Wibu.
4. THE Module_Selector SHALL menggunakan layout dan komponen autentikasi yang sudah ada tanpa membuat sistem login baru.
5. THE Admin_Panel SHALL memastikan refactor struktur URL admin tidak mempengaruhi fungsionalitas platform publik (halaman kuis, hub, dll).

---

### Requirement 6: Tampilan dan Identitas Visual Module Selector

**User Story:** Sebagai admin, saya ingin halaman pemilihan modul memiliki tampilan yang informatif dan konsisten dengan identitas Admin Panel, sehingga saya dapat dengan mudah mengidentifikasi dan memilih modul yang ingin dikelola.

#### Acceptance Criteria

1. THE Module_Selector SHALL menggunakan identitas visual yang konsisten dengan Admin_Panel yang sudah ada (warna, tipografi, layout).
2. THE Module_Selector SHALL menampilkan setiap Module_Card dengan ikon atau warna yang mencerminkan identitas modul (contoh: warna dan ikon bertema anime untuk Modul Wibu).
3. THE Module_Selector SHALL menampilkan jumlah item yang perlu ditinjau atau diperbarui pada setiap Active_Module (contoh: badge notifikasi jika ada draft konten).
4. THE Module_Selector SHALL menampilkan halaman secara responsif pada viewport lebar 320px hingga 1920px.
5. WHEN Module_Card difokuskan via keyboard, THE Module_Selector SHALL menampilkan indikator fokus yang jelas dan terlihat.
6. THE Module_Selector SHALL memastikan rasio kontras warna minimal 4.5:1 untuk semua teks yang ditampilkan.

---

### Requirement 7: Ekstensibilitas untuk Modul Baru

**User Story:** Sebagai developer, saya ingin arsitektur Module Selector mendukung penambahan modul baru di masa depan tanpa refactor besar, sehingga Admin Panel dapat tumbuh seiring bertambahnya modul platform.

#### Acceptance Criteria

1. THE Admin_Panel SHALL mendefinisikan struktur konfigurasi modul (slug, nama, deskripsi, status aktif, ikon) yang dapat diperluas untuk menambah modul baru.
2. THE Module_Selector SHALL merender Module_Card secara dinamis berdasarkan daftar modul yang dikonfigurasi, tanpa perubahan kode pada komponen Module_Selector.
3. WHEN modul baru ditambahkan ke konfigurasi dengan status aktif, THE Module_Selector SHALL menampilkan Module_Card yang dapat diklik dan mengarahkan ke `/admin/[slug-modul]` secara otomatis.
4. WHEN modul baru ditambahkan ke konfigurasi dengan status tidak aktif, THE Module_Selector SHALL menampilkan Module_Card dengan status "Belum Tersedia" secara otomatis.
5. THE Admin_Panel SHALL memastikan penambahan Module_Panel baru untuk modul baru tidak memerlukan perubahan pada struktur autentikasi atau layout Module_Selector.
