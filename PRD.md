# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Nama Produk:** `Seberapa Wibu Kamu?`  
**Versi:** 1.0  
**Tanggal:** 16 April 2026  
**Status:** MVP Ready  
**Dokumen Ini:** Diperkaya Nuansa Hiburan & Komedi Fandom  

---

## 1. 🎯 Visi & Latar Belakang
Membangun platform kuis interaktif berbahasa Indonesia yang tidak hanya mengukur tingkat "kewibuan", tetapi juga **menghibur, memancing tawa, dan memicu rasa "relate"** di kalangan komunitas anime/manga. Setiap interaksi dirancang ringan, self-aware, dan bebas toxic gatekeeping.

> *"Bukan untuk menghakimi, tapi untuk merayakan obsesi sehat sambil ketawa bareng."*

**Masalah yang Dipecahkan:**
- Kuis fandom tersebar, tidak terpusat, dan sering kali terlalu kaku atau justru jadi ajang pamer.
- Hasil kuis jarang dioptimalkan untuk viralitas visual + humor.
- Kurangnya ruang yang menggabungkan edukasi fandom dengan gaya penyampaian yang menghibur dan inklusif.

---

## 2. 👥 Target Pengguna & Persona
| Persona | Karakteristik | Ekspektasi Hiburan |
|---------|---------------|-------------------|
| **🌱 Si Casual** | Baru mulai nonton, hafal 2-3 judul populer | "Jelasin istilah tanpa bikin merasa bodoh, tapi tetap lucu & ringan" |
| **🔥 Si Veteran** | Udah nonton ratusan judul, koleksi merch, ikutin season | "Roast halus, referensi deep-cut, tantangan yang bikin mikir & ketawa" |
| **📱 Si Konten Kreator** | Aktif di TikTok/IG/Twitter, cari bahan viral | "Kartu hasil yang aesthetic + caption siap pakai, bracket voting yang dramatis" |
| **🎭 Si Komunitas** | Discord/Telegram group, sering ikut event con | "Leaderboard yang bisa dibangga-bangain, fitur vs/tantang teman, badge musiman" |

---

## 3. 🎭 Tone & Voice Guidelines (Nuansa Hiburan)
| Aspek | Panduan | Contoh |
|-------|---------|--------|
| **Gaya Bahasa** | Santai, self-aware, pakai plesetan anime/meme lokal, hindari jargon kaku | `"Skor kamu: 78% – Kamu sudah bisa bedakan opening yang 15 detik vs 1 menit."` |
| **Humor Type** | Wholesome roast, situational comedy, meta-joke fandom, anti-gatekeeping | `"Waifu/Husbando Wars: Jangan bawa ke grup WhatsApp keluarga."` |
| **Batasan** | ❌ Tidak menyinggung SARA, ❌ Tidak toxic/shaming, ❌ Tidak spoiler berat, ✅ Boleh nyindir kebiasaan binge nonton | `"Kalau belum tidur 3 hari karena cliffhanger, kamu normal. Bukan wibu, cuma kurang tidur."` |
| **Konsistensi** | Semua teks UI, error state, loading, hasil kuis, dan caption share mengikuti tone ini | `404: "Kamu tersesat di Isekai. Balik ke halaman awal?"` |

---

## 4. 📊 Goals & KPI (MVP + Hiburan)
| Metric | Target | Cara Ukur |
|--------|--------|-----------|
| Completion Rate | ≥ 65% | `(Finish / Start) × 100` |
| Share Rate | ≥ 30% | `(Share Clicks / Finish) × 100` |
| **Engagement Humor Rate** | ≥ 40% | `(Screenshot/Copy Caption + React) / Finish` |
| **Easter Egg Trigger Rate** | ≥ 15% | `(Hidden Interaction / Session)` |
| Avg. Session Duration | ≥ 3 menit | Plausible/Umami |
| Page Load (LCP) | ≤ 1.2 detik | Web Vitals |

---

## 5. 🗺️ Scope & Phasing
| Phase | Fitur | Status | Target Rilis |
|-------|-------|--------|--------------|
| **1 (MVP)** | Wibu Purity Test, Result Card Generator, Social Share, Info Page (Sejarah/Pengertian), Analytics | ✅ Scope | Bulan 1 |
| **2** | Kuis Tambahan (Caste/Title, Tebak OP/Waifu), Waifu/Husbando Wars, Leaderboard, User Profile Ringan | 🔄 Next | Bulan 2-3 |
| **3** | User Submission (soal/fanart), Badge Premium, Integrasi MAL/AniList, SEO Wiki/Blog | 📅 Later | Bulan 4+ |

---

## 6. 🧩 Spesifikasi Fitur (User Stories & Acceptance Criteria)

### F1. Wibu Purity Test (Core MVP)
- **Deskripsi:** 30-40 pertanyaan Ya/Tidak & Skala (1-5) dengan campuran trivia, kebiasaan, dan situasi komedi fandom.
- **Scoring Logic:**  
  `Skor = Σ(bobot_soal × jawaban) / Skor_Maksimal × 100`  
  Bobot: Tonton(1.2), Koleksi(1.5), Bahasa(0.8), Komunitas(1.3), Genre(1.0)
- **Nuansa Hiburan:** 
  - Opsi jawaban situasional: `"A) Nonton 3 episode lagi B) Tidur C) Baca wiki D) Nangis di pojok"`
  - Pertanyaan jebakan meme: `"Kamu pernah bilang 'ini anime underrated' padahal ratingnya 8.9 di MAL?"`
- **Acceptance Criteria:**
  - [ ] Bisa diselesaikan ≤ 3 menit tanpa login
  - [ ] Progress bar bergaya "HP/Mana" + toggle suara klik opsional
  - [ ] Hasil disimpan di `localStorage` (resume friendly)
  - [ ] Skor dikelompokkan ke 5 tier dengan judul, deskripsi humoris, dan "resep wibu"

### F2. Kartu Tanda Wibu / Sertifikat Sepuh (Viral Mechanic)
- **Deskripsi:** Generate gambar otomatis berisi skor, tier, nama (opsional), tanggal, QR/link, stempel komedi, dan disclaimer.
- **Format:** `1080×1080` & `1080×1920`
- **Nuansa Hiburan:**
  - Template rotasi musiman: `"Sertifikat Sepuh"`, `"Surat Izin Binge"`, `"Lulus Akademi Waifu"`, `"Dinyatakan Overclock"`
  - Random quote: `"Kamu tidak butuh motivasi. Kamu butuh update season baru."`
- **Acceptance Criteria:**
  - [ ] Generate ≤ 2 detik di client
  - [ ] Resolusi tinggi, teks tajam, watermark tidak mengganggu
  - [ ] Tombol download otomatis + preview sebelum save

### F3. Social Sharing Optimization
- **Deskripsi:** Tombol share ke X, IG, WA, Telegram, Copy Link.
- **Nuansa Hiburan:**
  - Caption generator otomatis dengan variasi: `roast`, `praise`, `dramatis`, `meme`
  - Hashtag dinamis sesuai tier: `#WibuLevelSepuh #AnimeAddictID #TolongSayaNggakBisaStop`
- **Acceptance Criteria:**
  - [ ] OG Meta Tags dinamis (`og:image`, `og:title`, `twitter:card`)
  - [ ] Pre-filled caption + tombol "Acak Ulang Caption"
  - [ ] Deep link ke `/result/{hash}` dengan preview konsisten
  - [ ] Fallback copy-to-clipboard

### F4. Halaman Informasi & Edukasi
- **Deskripsi:** Konten statis: asal usul "wibu", etika fandom, mitos vs fakta, rekomendasi starter.
- **Nuansa Hiburan:**
  - Judul section: `"Sejarah Wibu (Versi yang Nggak Bikin Ngantuk)"`, `"Kamus Otaku untuk Pemula yang Takut Kebawa Arus"`
  - Format: FAQ + Meme Breakdown + Timeline interaktif ringan
- **Acceptance Criteria:**
  - [ ] SEO-ready (`/wiki`, `/tentang-wibu`)
  - [ ] Loading ≤ 1s, mobile responsive
  - [ ] Navigasi jelas, tidak mengganggu flow kuis
  - [ ] Disclaimer hak cipta & fair use tercantum

### F5. Waifu/Husbando Wars (Phase 2)
- **Deskripsi:** Voting bulanan berbasis karakter. Bracket ala turnamen shonen.
- **Nuansa Hiburan:**
  - Matchup naming: `"Clash of the Tsunderes"`, `"Battle of the Isekai Protagonists"`
  - Komentar voting dengan reaction emoji khusus (🔥, 💀, 📉, 📈, 🥺)
- **Acceptance Criteria:**
  - [ ] Chart real-time update tiap 5 menit
  - [ ] Anti-bot + rate limit 1 vote/24h
  - [ ] Arsip per bulan dengan highlight "Plot Twist Winner"

### F6. Leaderboard & Gelar Sepuh (Phase 2)
- **Deskripsi:** Peringkat berdasarkan skor, streak, partisipasi voting.
- **Nuansa Hiburan:**
  - Gelar: `🌱 Casual Viewer` → `🌙 Discord Dweller` → `🔥 Sepuh Akademi` → `👑 Isekai'd`
  - Badge komedi: `"Nggak Tidur 3 Hari"`, `"Collector Impulsive"`, `"OP/ED Expert"`
- **Acceptance Criteria:**
  - [ ] Filter Mingguan/Bulanan/All-Time
  - [ ] Data anonim, patuhi privasi
  - [ ] Reset seasonal + hall of fame

---

## 7. 🎨 UI/UX & Micro-Interaksi (Entertainment-Focused)
| Elemen | Spesifikasi | Nuansa Hiburan |
|--------|-------------|----------------|
| **Loading Screen** | Spinner + teks berganti | `"Sedang memuat chakra..."`, `"Menghitung waifu..."`, `"Menghubungkan ke server Isekai..."` |
| **Error/404** | Halaman fallback | `"Kamu tersesat di dunia lain. Klik untuk balik ke rumah."` |
| **Progress Bar** | Custom CSS animation | Bentuk HP/Mana/EXP bar, warna berubah sesuai tier |
| **Feedback Jawaban** | Haptic + visual | ✅ Confetti + "Victory Fanfare" (toggle) \| ❌ Shake + "Skill gagal di-cast" |
| **Easter Eggs** | Hidden interaction | Konami code, klik logo 5x, atau kombinasi jawaban tertentu → unlock badge rahasia |
| **Aksesibilitas** | Kontras ≥ 4.5:1, keyboard nav | Tetap fun tapi tidak mengorbankan UX inklusif |

---

## 8. ⚙️ Arsitektur & Tech Stack
| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Frontend** | Next.js 15 (App Router) + Tailwind + Framer Motion | SSR/SSG, animasi ringan, SEO friendly |
| **State/Quiz** | Zustand + JSON pool | Mudah update soal & tone tanpa redeploy berat |
| **Image Gen** | `html2canvas` (client) / `@resvg/resvg-js` (server) | Cepat, konsisten, hemat bandwidth |
| **DB/Auth** | Supabase (Phase 2+) | Realtime, RLS, free tier cukup |
| **Hosting** | Vercel Edge | Auto CI/CD, CDN global, OG gen di edge |
| **Analytics** | Plausible / Umami | Privasi-friendly, ringan |
| **SEO/OG** | Next.js Metadata API + Dynamic OG Routes | Preview konsisten & viral-ready |

---

## 9. ⚖️ Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Humor terlalu niche/nyeleneh | Pengguna bingung atau merasa excluded | A/B test tone, panel komunitas, panduan "fun without toxic" |
| Viral tapi crash | Server overload saat trending | SSG + CDN, cache hasil 24 jam, rate limit API |
| Share rate rendah | Tidak mencapai audiens luas | Rotasi template kartu, caption generator, referral streak |
| Pelanggaran Hak Cipta | Takedown/reputasi | Ilustrasi original/siluet, teks kutipan pendek, disclaimer fan-made |
| Humor jadi toxic/gatekeeping | Komunitas terpecah | Filter komentar, moderasi ringan, tone guideline ketat |

---

## 10. 🗓️ Roadmap & Milestone
| Minggu | Deliverable | Checkpoint Hiburan |
|--------|-------------|-------------------|
| **1** | Wireframe, DB schema, JSON soal Purity, setup OG/Share | Draft tone guide, kumpulkan 10 meme reference aman |
| **2** | Quiz logic, progress bar, scoring, localStorage | Implement micro-interactions, Easter egg skeleton |
| **3** | Result card generator, dynamic OG, deploy MVP | A/B test 2 template kartu + caption style |
| **4** | QA, analytics, soft launch ke Discord/IG | Kumpulkan feedback humor: "Rate how funny (1-5)" |
| **5-6** | Patch, performance, Phase 2 DB prep | Refresh 30% soal dengan joke seasonal |
| **7-8** | 2 quiz type + Waifu Wars voting | Bracket naming, matchup banter system |
| **9-10** | Leaderboard, profile ringan, SEO wiki | Badge komedi, hall of fame design |
| **11-12** | Scale test, sponsor outreach | Pitch deck "Entertainment x Fandom" |

---

## 11. 📈 Rencana Iterasi & Feedback Loop
- **Bulanan:** Refresh 20% soal, ganti tema kartu musiman, update leaderboard season.
- **Kanal Feedback:** In-app micro-survey (`"Seberapa lucu kuis ini? 😐😂🤣"`), Discord/Telegram community, GitHub Issues.
- **Metrik Iterasi:** 
  - Jika share rate <25% → redesign kartu/preview + tambah variasi caption
  - Jika completion <50% → kurangi soal, tambah skip/"Lari dari Spoiler"
  - Jika humor rating <3.5 → audit tone, ganti referensi usang
- **A/B Testing:** Layout kartu, copy caption, posisi tombol share, difficulty curve, joke density.

---

## 📎 Lampiran & Next Steps (Untuk Development)
1. `quiz_purity.json` schema + contoh soal bernuansa humor
2. Dynamic OG route code snippet (`/api/og/result`)
3. `html2canvas` config untuk teks tajam & stempel komedi
4. Supabase RLS policy draft (Phase 2)
5. Checklist SEO, Social Meta Tags, & Tone Compliance

✅ **PRD ini siap dieksekusi.** Nuansa hiburan telah diintegrasikan ke dalam tone, UI, copywriting, fitur viral, dan metrik evaluasi tanpa mengorbankan struktur teknis atau kepatuhan hukum. Tentukan prioritas teknis pertama Anda, saya akan deliver template JSON, komponen React, atau skema DB dalam format siap-copy-paste. 🛠️✨