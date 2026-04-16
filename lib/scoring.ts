import type { Question, Kategori } from "./store/quizStore";

/** Bobot per kategori sesuai requirements 3.10 */
export const CATEGORY_WEIGHTS: Record<Kategori, number> = {
  Tonton: 1.2,
  Koleksi: 1.5,
  Bahasa: 0.8,
  Komunitas: 1.3,
  Genre: 1.0,
};

export interface TierInfo {
  tier: number;       // 1–5
  title: string;
  emoji: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export const TIERS: TierInfo[] = [
  {
    tier: 1,
    title: "Casual Viewer",
    emoji: "🌱",
    minScore: 0,
    maxScore: 19.99,
    description:
      "Kamu sesekali nonton anime kalau lagi bosan. Wibu? Belum. Tapi benih sudah ditanam. Hati-hati, satu season Naruto bisa mengubah segalanya.",
  },
  {
    tier: 2,
    title: "Anime Enjoyer",
    emoji: "🌸",
    minScore: 20,
    maxScore: 39.99,
    description:
      "Kamu suka anime tapi masih bisa hidup normal. Teman-temanmu belum curiga. Nikmati masa-masa ini sebelum terlambat.",
  },
  {
    tier: 3,
    title: "Wibu Terlatih",
    emoji: "⚔️",
    minScore: 40,
    maxScore: 59.99,
    description:
      "Kamu sudah melewati garis. Koleksi mulai menumpuk, kosakata Jepang mulai bocor ke percakapan sehari-hari. Tidak ada jalan kembali.",
  },
  {
    tier: 4,
    title: "Wibu Veteran",
    emoji: "🏆",
    minScore: 60,
    maxScore: 79.99,
    description:
      "Kamu adalah ensiklopedia anime berjalan. Orang-orang datang kepadamu untuk rekomendasi. Kamarmu adalah museum. Kamu bangga dengan itu.",
  },
  {
    tier: 5,
    title: "Sepuh Wibu",
    emoji: "👑",
    minScore: 80,
    maxScore: 100,
    description:
      "Kamu telah mencapai puncak kewibuan. Anime bukan sekadar hobi — itu adalah napas, identitas, dan tujuan hidup. Selamat datang di level tertinggi.",
  },
];

/**
 * Hitung skor kuis.
 * Formula: Σ(bobot_kategori × bobot_soal × jawaban) / Skor_Maksimal × 100
 */
export function calculateScore(
  answers: Record<number, number>,
  questions: Question[]
): number {
  if (questions.length === 0) return 0;

  let totalWeighted = 0;
  let maxWeighted = 0;

  for (const q of questions) {
    const categoryWeight = CATEGORY_WEIGHTS[q.kategori] ?? 1;
    const effectiveWeight = categoryWeight * q.bobot;
    const maxNilai = Math.max(...q.opsi_jawaban.map((o) => o.nilai));
    const userNilai = answers[q.id] ?? 0;

    totalWeighted += effectiveWeight * userNilai;
    maxWeighted += effectiveWeight * maxNilai;
  }

  if (maxWeighted === 0) return 0;
  return Math.round((totalWeighted / maxWeighted) * 100 * 10) / 10;
}

/** Kembalikan info tier berdasarkan skor 0–100 */
export function getTier(score: number): TierInfo {
  return (
    TIERS.find((t) => score >= t.minScore && score <= t.maxScore) ??
    TIERS[TIERS.length - 1]
  );
}
