export type BucinCategory = "Komunikasi" | "Pengorbanan" | "Prioritas" | "MediaSosial" | "Keuangan";

export type QuestionType = "ya_tidak" | "skala_1_5";

export interface BucinOpsiJawaban {
  nilai: number;
  label: string;
}

export interface BucinQuestion {
  id: number;
  teks: string;
  tipe: QuestionType;
  kategori: BucinCategory;
  bobot: number;
  opsi_jawaban: BucinOpsiJawaban[];
}

const YA_TIDAK: BucinOpsiJawaban[] = [
  { label: "Ya", nilai: 1 },
  { label: "Tidak", nilai: 0 },
];

export const BUCIN_QUESTIONS: BucinQuestion[] = [
  // --- Komunikasi ---
  {
    id: 1,
    teks: "Pernah mantengin chat ruang obrolan dia nunggu tulisan 'typing...' muncul?",
    tipe: "ya_tidak",
    kategori: "Komunikasi",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 2,
    teks: "Ganti nada dering atau notifikasi khusus cuma buat dia?",
    tipe: "ya_tidak",
    kategori: "Komunikasi",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 3,
    teks: "Panik dan overthinking kalau dia balas chat lama atau cuma 'Y'?",
    tipe: "ya_tidak",
    kategori: "Komunikasi",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 4,
    teks: "Minta maaf duluan padahal jelas-jelas dia yang salah?",
    tipe: "ya_tidak",
    kategori: "Komunikasi",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 5,
    teks: "Pernah nulis chat panjang banget tapi akhirnya dihapus dan cuma kirim stiker?",
    tipe: "ya_tidak",
    kategori: "Komunikasi",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },

  // --- Pengorbanan ---
  {
    id: 6,
    teks: "Rela jauh-jauh antar jemput dia padahal arahnya berlawanan 180 derajat sama jalan pulangmu?",
    tipe: "ya_tidak",
    kategori: "Pengorbanan",
    bobot: 1.3,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 7,
    teks: "Nemenin dia belanja atau jalan-jalan seharian padahal kamu lagi capek banget?",
    tipe: "ya_tidak",
    kategori: "Pengorbanan",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 8,
    teks: "Pernah bolos kelas/kerja demi bisa ketemu atau nemenin dia?",
    tipe: "ya_tidak",
    kategori: "Pengorbanan",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 9,
    teks: "Rela begadang buat nemenin dia teleponan padahal besok pagi ada urusan penting?",
    tipe: "ya_tidak",
    kategori: "Pengorbanan",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 10,
    teks: "Pura-pura suka hal yang dia suka (genre film, lagu, makanan) biar nyambung?",
    tipe: "ya_tidak",
    kategori: "Pengorbanan",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },

  // --- Prioritas ---
  {
    id: 11,
    teks: "Batalin janji nongkrong sama temen-temen tiba-tiba karena dia ngajak jalan?",
    tipe: "ya_tidak",
    kategori: "Prioritas",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 12,
    teks: "Password HP atau PIN ATM-mu ada hubungannya sama tanggal lahir/jadian dia?",
    tipe: "ya_tidak",
    kategori: "Prioritas",
    bobot: 1.3,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 13,
    teks: "Wallpaper HP atau PC-mu pakai foto dia atau foto berdua?",
    tipe: "ya_tidak",
    kategori: "Prioritas",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 14,
    teks: "Lupa waktu dan dunia nyata kalau udah asik jalan berdua bareng dia?",
    tipe: "ya_tidak",
    kategori: "Prioritas",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 15,
    teks: "Kalau disuruh milih, kamu lebih takut kehilangan dia daripada kehilangan HP kesayanganmu?",
    tipe: "ya_tidak",
    kategori: "Prioritas",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },

  // --- Media Sosial ---
  {
    id: 16,
    teks: "Pernah stalking akun sosmed barunya, mantan-mantannya, sampai ke temen-temen mantannya?",
    tipe: "ya_tidak",
    kategori: "MediaSosial",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 17,
    teks: "Punya akun second/fake khusus buat mantau story dia diem-diem?",
    tipe: "ya_tidak",
    kategori: "MediaSosial",
    bobot: 1.3,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 18,
    teks: "Arsip atau hapus semua foto yang gak ada dia di feed Instagram-mu?",
    tipe: "ya_tidak",
    kategori: "MediaSosial",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 19,
    teks: "Suka cemburu buta kalau liat dia nge-like atau komen di postingan lawan jenis?",
    tipe: "ya_tidak",
    kategori: "MediaSosial",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 20,
    teks: "Pamer foto bucin berdua pakai caption romantis yang panjang lebar?",
    tipe: "ya_tidak",
    kategori: "MediaSosial",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },

  // --- Keuangan ---
  {
    id: 21,
    teks: "Sering bayarin makan, tiket nonton, dan bensin pas lagi jalan berdua tanpa mikir?",
    tipe: "ya_tidak",
    kategori: "Keuangan",
    bobot: 1.0,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 22,
    teks: "Rela nabung berbulan-bulan cuma buat beli kado ulang tahun/anniversary mahal buat dia?",
    tipe: "ya_tidak",
    kategori: "Keuangan",
    bobot: 1.2,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 23,
    teks: "Rela makan mi instan di akhir bulan asalkan dia bisa makan enak saat kencan?",
    tipe: "ya_tidak",
    kategori: "Keuangan",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 24,
    teks: "Pernah diam-diam top-up e-wallet atau beliin pulsa ke dia padahal dia gak minta?",
    tipe: "ya_tidak",
    kategori: "Keuangan",
    bobot: 1.3,
    opsi_jawaban: YA_TIDAK,
  },
  {
    id: 25,
    teks: "Gak rela ngeluarin uang buat hal lain, tapi kalau buat dia berapapun pasti diusahain?",
    tipe: "ya_tidak",
    kategori: "Keuangan",
    bobot: 1.5,
    opsi_jawaban: YA_TIDAK,
  },
];
