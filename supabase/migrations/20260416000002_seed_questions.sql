-- ============================================================
-- Seed: Import questions from quiz_purity.json
-- ============================================================

insert into public.questions (teks, tipe, kategori, bobot, opsi_jawaban, aktif) values

-- Tonton (bobot 1.2)
('Apakah kamu pernah menonton lebih dari 100 judul anime?', 'ya_tidak', 'Tonton', 1.2,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa sering kamu menonton anime dalam seminggu?', 'skala_1_5', 'Tonton', 1.2,
 '[{"nilai":1,"label":"Hampir tidak pernah"},{"nilai":2,"label":"1-2 kali"},{"nilai":3,"label":"3-4 kali"},{"nilai":4,"label":"Hampir setiap hari"},{"nilai":5,"label":"Setiap hari, bahkan sambil makan"}]', true),

('Apakah kamu pernah skip tidur demi nonton anime sampai subuh?', 'ya_tidak', 'Tonton', 1.2,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa sering kamu binge-watch anime satu season dalam sehari?', 'skala_1_5', 'Tonton', 1.2,
 '[{"nilai":1,"label":"Tidak pernah"},{"nilai":2,"label":"Pernah sekali"},{"nilai":3,"label":"Beberapa kali"},{"nilai":4,"label":"Sering banget"},{"nilai":5,"label":"Itu rutinitas weekend-ku"}]', true),

('Apakah kamu punya list anime yang sudah ditonton (MAL, AniList, dll)?', 'ya_tidak', 'Tonton', 1.2,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Apakah kamu pernah menangis karena adegan anime?', 'ya_tidak', 'Tonton', 1.2,
 '[{"nilai":0,"label":"Tidak (bohong)"},{"nilai":1,"label":"Ya (dan tidak malu mengakuinya)"}]', true),

('Seberapa sering kamu re-watch anime yang sudah pernah ditonton?', 'skala_1_5', 'Tonton', 1.2,
 '[{"nilai":1,"label":"Tidak pernah, waktu terlalu berharga"},{"nilai":2,"label":"Jarang, hanya yang benar-benar favorit"},{"nilai":3,"label":"Kadang kalau kangen"},{"nilai":4,"label":"Sering, sudah hafal dialognya"},{"nilai":5,"label":"Re-watch adalah cara hidup"}]', true),

('Seberapa sering kamu mengikuti anime season terbaru (seasonal anime)?', 'skala_1_5', 'Tonton', 1.2,
 '[{"nilai":1,"label":"Tidak pernah, saya nonton yang sudah selesai"},{"nilai":2,"label":"Kadang, kalau ada yang menarik"},{"nilai":3,"label":"Biasanya ikut 2-3 judul per season"},{"nilai":4,"label":"Ikut 5-10 judul per season"},{"nilai":5,"label":"Saya nonton semua yang tayang, tanpa terkecuali"}]', true),

-- Koleksi (bobot 1.5)
('Seberapa banyak koleksi merchandise anime yang kamu punya?', 'skala_1_5', 'Koleksi', 1.5,
 '[{"nilai":1,"label":"Tidak ada sama sekali"},{"nilai":2,"label":"1-5 item"},{"nilai":3,"label":"6-20 item"},{"nilai":4,"label":"21-50 item"},{"nilai":5,"label":"Kamarku adalah toko anime"}]', true),

('Apakah kamu pernah membeli figure/nendoroid karakter anime?', 'ya_tidak', 'Koleksi', 1.5,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa besar budget bulananmu untuk merchandise/koleksi anime?', 'skala_1_5', 'Koleksi', 1.5,
 '[{"nilai":1,"label":"Rp 0 (saya waras)"},{"nilai":2,"label":"< Rp 100.000"},{"nilai":3,"label":"Rp 100.000 - 500.000"},{"nilai":4,"label":"Rp 500.000 - 2.000.000"},{"nilai":5,"label":"> Rp 2.000.000 (dompet menangis)"}]', true),

('Apakah kamu pernah membeli manga fisik atau light novel?', 'ya_tidak', 'Koleksi', 1.5,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa banyak koleksi manga/light novel fisik yang kamu punya?', 'skala_1_5', 'Koleksi', 1.5,
 '[{"nilai":1,"label":"Tidak ada"},{"nilai":2,"label":"1-10 volume"},{"nilai":3,"label":"11-30 volume"},{"nilai":4,"label":"31-100 volume"},{"nilai":5,"label":"> 100 volume (rak buku penuh)"}]', true),

('Apakah kamu pernah membeli dakimakura (bantal peluk) karakter anime?', 'ya_tidak', 'Koleksi', 1.5,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

-- Bahasa (bobot 0.8)
('Apakah kamu bisa membaca hiragana dan katakana?', 'ya_tidak', 'Bahasa', 0.8,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa sering kamu menonton anime tanpa subtitle?', 'skala_1_5', 'Bahasa', 0.8,
 '[{"nilai":1,"label":"Tidak pernah, saya butuh sub"},{"nilai":2,"label":"Kadang untuk scene familiar"},{"nilai":3,"label":"Bisa untuk anime slice of life"},{"nilai":4,"label":"Sering, paham 70-80%"},{"nilai":5,"label":"Selalu, subtitle itu untuk pemula"}]', true),

('Apakah kamu pernah belajar bahasa Jepang secara formal (kursus/aplikasi)?', 'ya_tidak', 'Bahasa', 0.8,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa banyak kosakata Jepang yang kamu tahu dari anime?', 'skala_1_5', 'Bahasa', 0.8,
 '[{"nilai":1,"label":"Hanya ''kawaii'' dan ''sugoi''"},{"nilai":2,"label":"Beberapa kata umum"},{"nilai":3,"label":"Cukup banyak untuk percakapan dasar"},{"nilai":4,"label":"Bisa ngerti dialog tanpa sub"},{"nilai":5,"label":"Saya bisa nulis surat ke seiyuu favorit"}]', true),

('Apakah kamu pernah menggunakan kata-kata Jepang dalam percakapan sehari-hari?', 'ya_tidak', 'Bahasa', 0.8,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa banyak opening/ending anime yang kamu hafal liriknya?', 'skala_1_5', 'Bahasa', 0.8,
 '[{"nilai":1,"label":"Tidak ada"},{"nilai":2,"label":"1-5 lagu"},{"nilai":3,"label":"6-20 lagu"},{"nilai":4,"label":"21-50 lagu"},{"nilai":5,"label":"> 50 lagu, saya bisa jadi karaoke machine"}]', true),

-- Komunitas (bobot 1.3)
('Apakah kamu aktif di komunitas anime online (Discord, forum, dll)?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa sering kamu berdiskusi tentang anime dengan orang lain?', 'skala_1_5', 'Komunitas', 1.3,
 '[{"nilai":1,"label":"Tidak pernah, ini rahasia"},{"nilai":2,"label":"Jarang, hanya dengan teman dekat"},{"nilai":3,"label":"Kadang-kadang"},{"nilai":4,"label":"Sering, siapapun yang mau dengerin"},{"nilai":5,"label":"Setiap hari, bahkan dengan kucing"}]', true),

('Apakah kamu pernah menghadiri event anime (Comifuro, AFA, dll)?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa aktif kamu posting konten anime di media sosial?', 'skala_1_5', 'Komunitas', 1.3,
 '[{"nilai":1,"label":"Tidak pernah"},{"nilai":2,"label":"Jarang, hanya kalau ada yang viral"},{"nilai":3,"label":"Kadang share meme atau review"},{"nilai":4,"label":"Sering, akun-ku penuh konten anime"},{"nilai":5,"label":"Akun-ku adalah akun anime"}]', true),

('Apakah kamu pernah cosplay karakter anime?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Apakah kamu punya waifu/husbando resmi?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak (saya masih waras)"},{"nilai":1,"label":"Ya (dan saya bangga)"}]', true),

('Apakah kamu pernah merekomendasikan anime ke orang yang tidak suka anime?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya (misi penyebaran wibu)"}]', true),

('Apakah kamu tahu perbedaan antara sub dan dub, dan punya preferensi kuat?', 'ya_tidak', 'Komunitas', 1.3,
 '[{"nilai":0,"label":"Tidak terlalu peduli"},{"nilai":1,"label":"Ya, dan saya siap debat soal ini"}]', true),

('Seberapa besar pengaruh anime terhadap selera musik, fashion, atau gaya hidupmu?', 'skala_1_5', 'Komunitas', 1.3,
 '[{"nilai":1,"label":"Tidak ada pengaruh sama sekali"},{"nilai":2,"label":"Sedikit, mungkin playlist musik"},{"nilai":3,"label":"Lumayan, beberapa aspek terpengaruh"},{"nilai":4,"label":"Banyak, anime membentuk identitasku"},{"nilai":5,"label":"Anime adalah kepribadianku"}]', true),

-- Genre (bobot 1.0)
('Seberapa luas pengetahuanmu tentang genre anime?', 'skala_1_5', 'Genre', 1.0,
 '[{"nilai":1,"label":"Hanya tahu shonen dan isekai"},{"nilai":2,"label":"Tahu beberapa genre populer"},{"nilai":3,"label":"Familiar dengan sebagian besar genre"},{"nilai":4,"label":"Tahu hampir semua genre termasuk yang niche"},{"nilai":5,"label":"Bisa ceramah 3 jam tentang subgenre"}]', true),

('Apakah kamu pernah menonton anime genre josei atau seinen?', 'ya_tidak', 'Genre', 1.0,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa sering kamu menonton anime yang bukan mainstream/populer?', 'skala_1_5', 'Genre', 1.0,
 '[{"nilai":1,"label":"Tidak pernah, saya ikut arus"},{"nilai":2,"label":"Jarang, kalau ada rekomendasi"},{"nilai":3,"label":"Kadang explore sendiri"},{"nilai":4,"label":"Sering, hidden gem itu lebih seru"},{"nilai":5,"label":"Saya sudah nonton semua yang ada di MAL top 500"}]', true),

('Apakah kamu pernah menonton anime dengan rating dewasa (ecchi/harem)?', 'ya_tidak', 'Genre', 1.0,
 '[{"nilai":0,"label":"Tidak"},{"nilai":1,"label":"Ya"}]', true),

('Seberapa dalam kamu mengikuti lore/worldbuilding anime favoritmu?', 'skala_1_5', 'Genre', 1.0,
 '[{"nilai":1,"label":"Saya hanya nonton, tidak mikir dalam"},{"nilai":2,"label":"Paham plot utama saja"},{"nilai":3,"label":"Baca wiki kalau ada yang bingung"},{"nilai":4,"label":"Hafal detail lore dan teori"},{"nilai":5,"label":"Saya bisa nulis ensiklopedia-nya"}]', true),

('Seberapa sering kamu membaca manga atau light novel?', 'skala_1_5', 'Genre', 1.0,
 '[{"nilai":1,"label":"Tidak pernah"},{"nilai":2,"label":"Jarang, hanya kalau anime-nya belum selesai"},{"nilai":3,"label":"Kadang-kadang"},{"nilai":4,"label":"Sering, manga > anime"},{"nilai":5,"label":"Setiap hari, saya sudah baca ratusan judul"}]', true);
