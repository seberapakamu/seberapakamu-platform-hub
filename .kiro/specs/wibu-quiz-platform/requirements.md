# Requirements Document

## Introduction

"Seberapa Wibu Kamu?" adalah platform kuis interaktif berbahasa Indonesia yang mengukur tingkat "kewibuan" pengguna dengan pendekatan hiburan dan komedi fandom. Platform ini mencakup kuis purity test, generator kartu hasil viral, social sharing, halaman informasi/wiki, dan panel admin untuk manajemen konten. Alur utama pengguna: Landing Page → Isi Username → Mulai Kuis → Navigasi Pertanyaan → Lihat Hasil → Download/Share Kartu.

---

## Glossary

- **Platform**: Sistem website "Seberapa Wibu Kamu?" secara keseluruhan.
- **Quiz_Engine**: Komponen yang mengelola logika kuis, navigasi pertanyaan, dan kalkulasi skor.
- **Result_Generator**: Komponen yang menghasilkan kartu hasil visual berformat gambar.
- **Share_Module**: Komponen yang menangani social sharing dan pembuatan shareable link.
- **Admin_Panel**: Antarmuka pengelolaan konten dan konfigurasi platform untuk admin.
- **CMS**: Content Management System untuk mengelola halaman info, wiki, dan blog.
- **Pengguna**: Pengunjung website yang mengikuti kuis tanpa perlu login.
- **Admin**: Pengguna terautentikasi yang memiliki akses ke Admin_Panel.
- **Tier**: Kategori hasil kuis berdasarkan rentang skor (5 level dari Casual hingga Sepuh).
- **Result_Card**: Gambar yang digenerate berisi skor, tier, username, dan elemen visual.
- **Session**: Satu sesi kuis dari awal hingga selesai atau ditinggalkan.
- **Hash**: Identifikasi unik untuk setiap hasil kuis yang digunakan pada shareable URL.
- **localStorage**: Penyimpanan browser lokal untuk menyimpan progres kuis.

---

## Requirements

### Requirement 1: Landing Page

**User Story:** Sebagai pengguna baru, saya ingin melihat halaman utama yang informatif dan menarik, sehingga saya memahami apa itu platform ini dan termotivasi untuk mulai kuis.

#### Acceptance Criteria

1. THE Platform SHALL menampilkan deskripsi singkat tentang website pada halaman utama (`/`).
2. THE Platform SHALL menampilkan statistik jumlah pengguna yang telah mengikuti kuis secara real-time.
3. THE Platform SHALL menampilkan daftar kuis yang tersedia beserta deskripsi singkat masing-masing kuis.
4. THE Platform SHALL menyediakan navigasi ke halaman info/wiki dari halaman utama.
5. THE Platform SHALL menyediakan navigasi ke halaman blog dari halaman utama.
6. WHEN pengguna mengklik tombol mulai kuis, THE Platform SHALL mengarahkan pengguna ke halaman input username.
7. THE Platform SHALL memuat halaman utama dengan Largest Contentful Paint (LCP) ≤ 1.2 detik.
8. THE Platform SHALL menampilkan halaman utama secara responsif pada perangkat mobile, tablet, dan desktop.

---

### Requirement 2: Input Username Sebelum Kuis

**User Story:** Sebagai pengguna, saya ingin mengisi username sebelum memulai kuis, sehingga nama saya bisa ditampilkan di kartu hasil.

#### Acceptance Criteria

1. THE Platform SHALL menampilkan form input username sebelum kuis dimulai.
2. THE Quiz_Engine SHALL menerima username dengan panjang 1 hingga 30 karakter.
3. IF pengguna mengosongkan field username dan mencoba melanjutkan, THEN THE Platform SHALL menampilkan pesan error yang menginformasikan bahwa username wajib diisi.
4. IF pengguna memasukkan username yang mengandung karakter tidak valid (seperti HTML tags atau script), THEN THE Platform SHALL menolak input dan menampilkan pesan error.
5. WHEN pengguna mengklik tombol lanjut dengan username valid, THE Platform SHALL menyimpan username ke localStorage dan mengarahkan ke halaman kuis.

---

### Requirement 3: Kuis Purity Test

**User Story:** Sebagai pengguna, saya ingin mengikuti kuis dengan pertanyaan yang menarik dan bisa dinavigasi bebas, sehingga saya bisa menjawab dengan nyaman dan mendapatkan skor yang akurat.

#### Acceptance Criteria

1. THE Quiz_Engine SHALL menampilkan 30 hingga 40 pertanyaan per sesi kuis.
2. THE Quiz_Engine SHALL mendukung tipe pertanyaan Ya/Tidak dan Skala 1-5.
3. THE Quiz_Engine SHALL menampilkan progress bar bergaya HP/Mana yang menunjukkan persentase pertanyaan yang telah dijawab.
4. WHEN pengguna menjawab pertanyaan, THE Quiz_Engine SHALL menyimpan jawaban ke localStorage secara otomatis.
5. THE Quiz_Engine SHALL memungkinkan pengguna menavigasi ke pertanyaan mana pun (maju dan mundur) selama sesi kuis berlangsung.
6. WHEN pengguna menutup browser dan membuka kembali URL kuis, THE Platform SHALL menampilkan pilihan untuk melanjutkan sesi sebelumnya atau memulai ulang.
7. WHEN pengguna memilih melanjutkan, THE Quiz_Engine SHALL memuat kembali jawaban dan posisi pertanyaan dari localStorage.
8. WHEN pengguna memilih memulai ulang, THE Quiz_Engine SHALL menghapus data sesi sebelumnya dari localStorage dan memulai dari pertanyaan pertama.
9. WHEN semua pertanyaan telah dijawab dan pengguna mengklik tombol selesai, THE Quiz_Engine SHALL menghitung skor menggunakan formula: `Skor = Σ(bobot_soal × jawaban) / Skor_Maksimal × 100`.
10. THE Quiz_Engine SHALL menerapkan bobot kategori: Tonton(1.2), Koleksi(1.5), Bahasa(0.8), Komunitas(1.3), Genre(1.0).
11. THE Quiz_Engine SHALL mengelompokkan skor ke dalam 5 tier dengan judul dan deskripsi humoris.
12. WHERE fitur batas waktu diaktifkan oleh Admin, THE Quiz_Engine SHALL menampilkan countdown timer dan menghentikan kuis ketika waktu habis.

---

### Requirement 4: Halaman Hasil Kuis

**User Story:** Sebagai pengguna yang telah menyelesaikan kuis, saya ingin melihat hasil lengkap dengan berbagai aksi lanjutan, sehingga saya bisa berbagi, mengulang, atau menantang teman.

#### Acceptance Criteria

1. WHEN kuis selesai, THE Platform SHALL menampilkan halaman hasil di URL `/result/{hash}` dengan hash unik per sesi.
2. THE Platform SHALL menampilkan skor numerik, nama tier, deskripsi tier humoris, dan username pengguna pada halaman hasil.
3. THE Platform SHALL menampilkan tombol "Ulangi Kuis" yang mengarahkan pengguna kembali ke halaman input username.
4. THE Platform SHALL menampilkan tombol "Tantang Teman" yang menghasilkan shareable link berisi hash hasil.
5. THE Platform SHALL menampilkan tombol "Lihat Leaderboard" pada halaman hasil.
6. WHEN pengguna lain membuka URL `/result/{hash}`, THE Platform SHALL menampilkan preview hasil kuis milik pengguna tersebut secara read-only.
7. THE Platform SHALL menyertakan Open Graph meta tags dinamis (`og:image`, `og:title`, `og:description`, `twitter:card`) pada setiap URL `/result/{hash}`.

---

### Requirement 5: Generator Kartu Hasil (Result Card)

**User Story:** Sebagai pengguna, saya ingin mendapatkan kartu hasil visual yang menarik dan bisa diunduh, sehingga saya bisa membagikannya di media sosial.

#### Acceptance Criteria

1. THE Result_Generator SHALL menghasilkan gambar Result_Card dalam format 1080×1080 piksel dan 1080×1920 piksel.
2. THE Result_Generator SHALL menampilkan preview Result_Card sebelum pengguna mengunduh.
3. THE Result_Generator SHALL menyelesaikan proses generate gambar dalam waktu ≤ 2 detik di sisi klien.
4. THE Result_Generator SHALL menyertakan skor, tier, username, tanggal, dan watermark platform pada Result_Card.
5. THE Result_Generator SHALL menampilkan teks yang tajam dan terbaca pada resolusi tinggi.
6. THE Result_Generator SHALL memilih template kartu secara acak dari kumpulan template yang tersedia (contoh: "Sertifikat Sepuh", "Surat Izin Binge", "Lulus Akademi Waifu").
7. THE Result_Generator SHALL menyertakan random quote humoris pada Result_Card.
8. WHEN pengguna mengklik tombol download, THE Platform SHALL mengunduh gambar Result_Card secara otomatis ke perangkat pengguna.

---

### Requirement 6: Social Sharing

**User Story:** Sebagai pengguna, saya ingin membagikan hasil kuis ke berbagai platform media sosial dengan caption yang menarik, sehingga teman-teman saya bisa melihat dan ikut kuis.

#### Acceptance Criteria

1. THE Share_Module SHALL menyediakan tombol share ke platform X (Twitter), Instagram, WhatsApp, dan Telegram.
2. THE Share_Module SHALL menyediakan tombol "Salin Link" yang menyalin URL `/result/{hash}` ke clipboard.
3. THE Share_Module SHALL menghasilkan caption otomatis yang bervariasi berdasarkan tier pengguna dengan gaya roast, praise, dramatis, atau meme.
4. THE Share_Module SHALL menyertakan hashtag dinamis sesuai tier pada caption yang digenerate.
5. THE Platform SHALL menyediakan tombol "Acak Ulang Caption" yang menghasilkan variasi caption berbeda.
6. IF browser tidak mendukung Web Share API, THEN THE Share_Module SHALL menampilkan fallback berupa tombol copy-to-clipboard.
7. WHEN pengguna mengklik tombol share ke platform tertentu, THE Share_Module SHALL membuka dialog share dengan caption dan link yang sudah terisi.

---

### Requirement 7: Halaman Informasi & Wiki

**User Story:** Sebagai pengguna yang ingin belajar tentang budaya wibu/anime, saya ingin membaca konten informatif yang disajikan dengan cara yang menyenangkan, sehingga saya bisa memahami tanpa merasa digurui.

#### Acceptance Criteria

1. THE Platform SHALL menyediakan halaman informasi di URL `/wiki` dan `/tentang-wibu`.
2. THE Platform SHALL menampilkan konten dengan format FAQ, meme breakdown, dan timeline interaktif ringan.
3. THE Platform SHALL memuat halaman informasi dalam waktu ≤ 1 detik.
4. THE Platform SHALL menampilkan halaman informasi secara responsif pada semua ukuran layar.
5. THE Platform SHALL menyertakan disclaimer hak cipta dan fair use pada halaman informasi.
6. THE Platform SHALL mengoptimalkan halaman informasi untuk SEO dengan meta tags yang sesuai.
7. THE Platform SHALL memastikan navigasi dari halaman informasi tidak mengganggu alur kuis yang sedang berjalan.

---

### Requirement 8: Autentikasi Admin

**User Story:** Sebagai admin, saya ingin login dengan email dan password, sehingga saya bisa mengakses panel admin dengan aman.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menyediakan halaman login di URL `/admin/login` dengan form email dan password.
2. WHEN admin memasukkan email dan password yang valid, THE Admin_Panel SHALL membuat sesi autentikasi dan mengarahkan ke dashboard admin.
3. IF admin memasukkan email atau password yang salah, THEN THE Admin_Panel SHALL menampilkan pesan error tanpa mengungkapkan informasi spesifik tentang field mana yang salah.
4. IF admin gagal login sebanyak 5 kali berturut-turut, THEN THE Admin_Panel SHALL mengunci akun selama 15 menit dan menampilkan pesan yang sesuai.
5. THE Admin_Panel SHALL menggunakan HTTPS untuk semua komunikasi autentikasi.
6. WHEN admin mengklik tombol logout, THE Admin_Panel SHALL menghapus sesi autentikasi dan mengarahkan ke halaman login.
7. IF sesi admin tidak aktif selama 60 menit, THEN THE Admin_Panel SHALL secara otomatis mengakhiri sesi dan mengarahkan ke halaman login.
8. WHILE admin belum terautentikasi, THE Admin_Panel SHALL menolak akses ke semua halaman admin dan mengarahkan ke halaman login.

---

### Requirement 9: Manajemen Soal Kuis (Admin)

**User Story:** Sebagai admin, saya ingin mengelola soal-soal kuis melalui panel admin, sehingga saya bisa memperbarui konten tanpa harus mengubah kode.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar semua soal kuis yang ada beserta tipe, kategori, dan bobot masing-masing.
2. THE Admin_Panel SHALL menyediakan form untuk menambahkan soal baru dengan field: teks pertanyaan, tipe (Ya/Tidak atau Skala 1-5), kategori, bobot, dan opsi jawaban.
3. THE Admin_Panel SHALL menyediakan form untuk mengedit soal yang sudah ada.
4. WHEN admin menghapus soal, THE Admin_Panel SHALL menampilkan konfirmasi sebelum penghapusan dilakukan.
5. THE Admin_Panel SHALL memvalidasi bahwa setiap soal memiliki teks pertanyaan, tipe, kategori, dan bobot yang valid sebelum disimpan.
6. IF admin mencoba menyimpan soal dengan field wajib yang kosong, THEN THE Admin_Panel SHALL menampilkan pesan error yang spesifik per field.
7. THE Admin_Panel SHALL memungkinkan admin mengaktifkan atau menonaktifkan soal tanpa menghapusnya.
8. WHERE fitur batas waktu kuis diaktifkan, THE Admin_Panel SHALL menyediakan konfigurasi durasi waktu kuis dalam satuan menit.

---

### Requirement 10: Manajemen Konten (CMS)

**User Story:** Sebagai admin, saya ingin mengelola konten halaman info, wiki, dan blog melalui panel admin, sehingga saya bisa memperbarui informasi tanpa bantuan developer.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan editor teks kaya (rich text editor) untuk membuat dan mengedit konten halaman.
2. THE CMS SHALL memungkinkan admin membuat, mengedit, mempublikasikan, dan menghapus artikel blog.
3. THE CMS SHALL memungkinkan admin mengelola konten halaman info/wiki (`/wiki`, `/tentang-wibu`).
4. THE CMS SHALL mendukung penambahan gambar pada konten artikel.
5. WHEN admin mempublikasikan artikel, THE Platform SHALL menampilkan artikel tersebut di halaman blog publik.
6. THE CMS SHALL menyimpan draft artikel yang belum dipublikasikan.
7. IF admin menghapus artikel yang sudah dipublikasikan, THEN THE CMS SHALL menampilkan konfirmasi dan menghapus artikel dari halaman publik setelah dikonfirmasi.
8. THE CMS SHALL menampilkan daftar semua konten dengan status (draft/published) dan tanggal terakhir diubah.

---

### Requirement 11: Statistik & Analytics (Admin)

**User Story:** Sebagai admin, saya ingin melihat statistik penggunaan platform, sehingga saya bisa memantau performa dan membuat keputusan berbasis data.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan total jumlah sesi kuis yang dimulai dan diselesaikan.
2. THE Admin_Panel SHALL menampilkan completion rate dengan formula `(Selesai / Dimulai) × 100`.
3. THE Admin_Panel SHALL menampilkan share rate dengan formula `(Klik Share / Selesai) × 100`.
4. THE Admin_Panel SHALL menampilkan distribusi tier dari semua hasil kuis.
5. THE Admin_Panel SHALL menampilkan rata-rata durasi sesi kuis.
6. THE Platform SHALL mengintegrasikan analytics yang privacy-friendly (Plausible atau Umami).

---

### Requirement 12: Performa & Aksesibilitas

**User Story:** Sebagai pengguna, saya ingin platform berjalan cepat dan dapat diakses dengan baik, sehingga pengalaman saya tidak terganggu oleh masalah teknis.

#### Acceptance Criteria

1. THE Platform SHALL memuat halaman utama dengan LCP ≤ 1.2 detik.
2. THE Platform SHALL memuat halaman informasi dalam waktu ≤ 1 detik.
3. THE Result_Generator SHALL menyelesaikan generate gambar dalam waktu ≤ 2 detik.
4. THE Platform SHALL memastikan rasio kontras warna minimal 4.5:1 untuk semua teks konten.
5. THE Platform SHALL mendukung navigasi keyboard penuh pada semua elemen interaktif.
6. THE Platform SHALL menampilkan semua halaman secara responsif pada viewport lebar 320px hingga 1920px.
7. THE Platform SHALL menyediakan teks alternatif (alt text) untuk semua gambar konten.
8. THE Platform SHALL menampilkan halaman error 404 dengan pesan humoris dan tautan kembali ke halaman utama.
