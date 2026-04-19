import type { BucinQuestion, BucinCategory } from "./bucin-questions";
import type { TierInfo } from "./scoring";

/** Bobot per kategori Bucin */
export const BUCIN_CATEGORY_WEIGHTS: Record<BucinCategory, number> = {
  Komunikasi: 1.0,
  Pengorbanan: 1.3,
  Prioritas: 1.2,
  MediaSosial: 0.8,
  Keuangan: 1.5,
};

export const BUCIN_TIERS: TierInfo[] = [
  {
    tier: 1,
    title: "Hati Es",
    emoji: "🧊",
    minScore: 0,
    maxScore: 19.99,
    description:
      "Logika di atas segalanya. Kamu terlalu rasional untuk jatuh cinta terlalu dalam, atau mungkin kamu memang belum ketemu orang yang tepat aja. Tetap cool!",
  },
  {
    tier: 2,
    title: "Normal",
    emoji: "😊",
    minScore: 20,
    maxScore: 39.99,
    description:
      "Sayang sewajarnya. Kamu peduli tapi tetap punya batasan yang sehat. Teman-temanmu masih bisa ngajak kamu nongkrong tanpa di-cancel tiba-tiba.",
  },
  {
    tier: 3,
    title: "Bucin Pemula",
    emoji: "🥺",
    minScore: 40,
    maxScore: 59.99,
    description:
      "Benih kebucinan mulai tumbuh! Kamu sering overthinking soal dia dan mulai kompromi demi pasangan. Hati-hati, dari sini jalannya menurun tajam ke arah kebucinan akut.",
  },
  {
    tier: 4,
    title: "Bucin Akut",
    emoji: "😍",
    minScore: 60,
    maxScore: 79.99,
    description:
      "Dunia milik berdua, yang lain cuma ngontrak! Prioritas utamamu adalah dia. Kamu rela berkorban banyak hal asalkan ayang seneng.",
  },
  {
    tier: 5,
    title: "Budak Cinta Sejati",
    emoji: "🧎‍♂️",
    minScore: 80,
    maxScore: 100,
    description:
      "Totalitas tanpa batas! Kamu adalah definisi sejati dari kata 'Bucin'. Kamu rela memberikan segalanya (uang, waktu, harga diri) demi pasangan. Sangat disarankan untuk ingat diri sendiri ya!",
  },
];

/**
 * Hitung skor kuis bucin.
 * Formula: Σ(bobot_kategori × bobot_soal × jawaban) / Skor_Maksimal × 100
 */
export function calculateBucinScore(
  answers: Record<number, number>,
  questions: BucinQuestion[]
): number {
  if (questions.length === 0) return 0;

  let totalWeighted = 0;
  let maxWeighted = 0;

  for (const q of questions) {
    const categoryWeight = BUCIN_CATEGORY_WEIGHTS[q.kategori] ?? 1;
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
export function getBucinTier(score: number): TierInfo {
  return (
    BUCIN_TIERS.find((t) => score >= t.minScore && score <= t.maxScore) ??
    BUCIN_TIERS[BUCIN_TIERS.length - 1]
  );
}
