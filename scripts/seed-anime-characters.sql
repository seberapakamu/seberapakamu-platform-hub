-- Seed data untuk tabel anime_characters
-- Jalankan di Supabase SQL Editor
-- Gambar menggunakan CDN MyAnimeList via Jikan API (cdn.myanimelist.net)

INSERT INTO anime_characters (nama, asal_anime, siluet_url, kutipan, kekuatan, deskripsi, aktif) VALUES
(
  'Naruto Uzumaki',
  'Naruto',
  'https://cdn.myanimelist.net/images/characters/2/284121.jpg',
  'Dattebayo! Aku pasti akan jadi Hokage!',
  'Rasengan, Shadow Clone Jutsu, Sage Mode, Nine-Tails Chakra Mode',
  'Ninja dari Desa Konoha yang bermimpi menjadi Hokage. Dikenal dengan semangatnya yang tak pernah padam dan kekuatan ekor sembilan.',
  TRUE
),
(
  'Monkey D. Luffy',
  'One Piece',
  'https://cdn.myanimelist.net/images/characters/9/310307.jpg',
  'Aku akan menjadi Raja Bajak Laut!',
  'Gomu Gomu no Mi (Buah Karet), Haki, Gear Second, Gear Third, Gear Fourth, Gear Fifth',
  'Kapten Bajak Laut Topi Jerami yang memiliki tubuh karet. Bermimpi menemukan One Piece dan menjadi Raja Bajak Laut.',
  TRUE
),
(
  'Goku',
  'Dragon Ball Z',
  'https://cdn.myanimelist.net/images/characters/15/72534.jpg',
  'Aku adalah Saiyan yang lahir di Bumi — Son Goku!',
  'Super Saiyan, Kamehameha, Instant Transmission, Ultra Instinct',
  'Saiyan yang dibesarkan di Bumi. Selalu berusaha menjadi lebih kuat dan melindungi orang-orang yang dicintainya.',
  TRUE
),
(
  'Levi Ackerman',
  'Attack on Titan',
  'https://cdn.myanimelist.net/images/characters/2/241413.jpg',
  'Pilihan terbaik adalah pilihan yang tidak akan kamu sesali.',
  'Omni-Directional Mobility Gear, Ackerman Power, kecepatan dan kekuatan luar biasa',
  'Kapten Pasukan Pengintai yang dikenal sebagai tentara terkuat umat manusia. Dingin namun sangat peduli pada anak buahnya.',
  TRUE
),
(
  'Itachi Uchiha',
  'Naruto',
  'https://cdn.myanimelist.net/images/characters/9/131317.jpg',
  'Maafkan aku, Sasuke. Ini adalah terakhir kalinya.',
  'Sharingan, Mangekyou Sharingan, Amaterasu, Tsukuyomi, Susanoo',
  'Ninja jenius dari klan Uchiha yang mengorbankan segalanya demi melindungi adiknya dan desa Konoha.',
  TRUE
),
(
  'Killua Zoldyck',
  'Hunter x Hunter',
  'https://cdn.myanimelist.net/images/characters/7/84198.jpg',
  'Aku tidak takut mati. Yang aku takuti adalah kehilangan orang yang aku sayangi.',
  'Transmutation Nen, Godspeed, Lightning Palm, Whirlwind',
  'Anggota keluarga pembunuh bayaran Zoldyck yang melarikan diri untuk menjadi Hunter bersama sahabatnya Gon.',
  TRUE
),
(
  'Mikasa Ackerman',
  'Attack on Titan',
  'https://cdn.myanimelist.net/images/characters/9/215563.jpg',
  'Dunia ini kejam, tapi juga indah.',
  'Omni-Directional Mobility Gear, Ackerman Power, kemampuan tempur luar biasa',
  'Tentara terbaik angkatan ke-104 yang selalu melindungi Eren. Memiliki darah Ackerman yang memberinya kekuatan luar biasa.',
  TRUE
),
(
  'Roronoa Zoro',
  'One Piece',
  'https://cdn.myanimelist.net/images/characters/3/100534.jpg',
  'Aku tidak akan pernah kalah lagi. Sampai aku menjadi pedang terkuat di dunia!',
  'Three Sword Style, Haki, Asura, Santoryu Ogi: Sanzen Sekai',
  'Wakil kapten Bajak Laut Topi Jerami yang bercita-cita menjadi pedang terkuat di dunia. Selalu tersesat tapi tak pernah menyerah.',
  TRUE
),
(
  'Rem',
  'Re:Zero kara Hajimeru Isekai Seikatsu',
  'https://cdn.myanimelist.net/images/characters/15/436116.jpg',
  'Aku jatuh cinta padamu, Subaru-kun.',
  'Oni Power, Morning Star Flail, Water Magic, Demon Form',
  'Pembantu kembar di Roswaal Mansion yang awalnya mencurigai Subaru. Dikenal karena kesetiaannya yang tak tergoyahkan.',
  TRUE
),
(
  'Nezuko Kamado',
  'Kimetsu no Yaiba',
  'https://cdn.myanimelist.net/images/characters/10/378745.jpg',
  '(Ekspresi matanya mengungkapkan segalanya)',
  'Blood Demon Art: Exploding Blood, Demon Regeneration, Demon Form',
  'Adik Tanjiro yang berubah menjadi iblis namun tetap mempertahankan kemanusiaannya. Melindungi kakaknya dengan kekuatan iblis yang unik.',
  TRUE
)
ON CONFLICT DO NOTHING;
