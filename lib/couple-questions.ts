export interface CoupleQuestion {
  id: number;
  teks: string;
  opsi: {
    label: string;
    value: string;
  }[];
}

export const COUPLE_SYNC_QUESTIONS: CoupleQuestion[] = [
  {
    id: 1,
    teks: "Apa tipe kencan favorit kalian?",
    opsi: [
      { label: "Dinner Romantis", value: "A" },
      { label: "Main Game Bareng", value: "B" },
    ],
  },
  {
    id: 2,
    teks: "Liburan impian kalian ke mana?",
    opsi: [
      { label: "Pantai yang Tenang", value: "A" },
      { label: "Gunung yang Sejuk", value: "B" },
    ],
  },
  {
    id: 3,
    teks: "Kalau ada masalah, biasanya...",
    opsi: [
      { label: "Langsung diobrolin", value: "A" },
      { label: "Kasih waktu buat sendiri dulu", value: "B" },
    ],
  },
  {
    id: 4,
    teks: "Siapa yang lebih sering ngalah?",
    opsi: [
      { label: "Aku", value: "A" },
      { label: "Dia", value: "B" },
    ],
  },
  {
    id: 5,
    teks: "Tipe komunikasi kalian...",
    opsi: [
      { label: "Chattingan terus", value: "A" },
      { label: "Video call / Telepon", value: "B" },
    ],
  },
  {
    id: 6,
    teks: "Lebih suka dikasih apa?",
    opsi: [
      { label: "Barang / Kado", value: "A" },
      { label: "Waktu / Deep talk", value: "B" },
    ],
  },
  {
    id: 7,
    teks: "Kegiatan di rumah paling seru?",
    opsi: [
      { label: "Nonton Film/Netflix", value: "A" },
      { label: "Masak Bareng", value: "B" },
    ],
  },
  {
    id: 8,
    teks: "Siapa yang paling pelupa?",
    opsi: [
      { label: "Aku", value: "A" },
      { label: "Dia", value: "B" },
    ],
  },
  {
    id: 9,
    teks: "Kalau lagi kangen...",
    opsi: [
      { label: "Langsung bilang", value: "A" },
      { label: "Kasih kode-kode", value: "B" },
    ],
  },
  {
    id: 10,
    teks: "Pilih mana: Masa Depan atau Sekarang?",
    opsi: [
      { label: "Nabung buat masa depan", value: "A" },
      { label: "Nikmatin momen sekarang", value: "B" },
    ],
  },
];
