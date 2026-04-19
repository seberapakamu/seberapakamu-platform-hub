// lib/tebakScoring.ts

import type { TebakConfig, TebakRank } from "./types/tebak";

export const TEBAK_RANKS: Array<{
  rank: TebakRank;
  min: number;
  max: number;
  emoji: string;
  description: string;
}> = [
  { rank: "Pemula Wibu",   min: 0,   max: 249,  emoji: "🌱", description: "Masih baru di dunia anime, tapi semangat belajarnya patut diacungi jempol!" },
  { rank: "Wibu Biasa",    min: 250, max: 499,  emoji: "🌸", description: "Sudah cukup kenal dunia anime, tapi masih banyak karakter yang belum dikenal." },
  { rank: "Wibu Sejati",   min: 500, max: 699,  emoji: "⚔️", description: "Pengetahuan anime yang solid! Kamu tahu banyak karakter ikonik." },
  { rank: "Wibu Veteran",  min: 700, max: 899,  emoji: "🏆", description: "Hampir tak ada karakter yang bisa lolos dari pengamatanmu!" },
  { rank: "Sepuh Wibu",    min: 900, max: 1000, emoji: "👑", description: "Legenda hidup dunia anime. Pengetahuanmu tak tertandingi!" },
];

/**
 * Hitung skor soal berdasarkan jumlah petunjuk yang digunakan.
 * hintsUsed: 1–4 (benar), 0 (gagal/tidak menjawab)
 */
export function calculateSoalScore(
  hintsUsed: number,
  correct: boolean,
  config: TebakConfig
): number {
  if (!correct) return 0;
  const scoreMap: Record<number, number> = {
    1: config.score_hint_1,
    2: config.score_hint_2,
    3: config.score_hint_3,
    4: config.score_hint_4,
  };
  return scoreMap[hintsUsed] ?? 0;
}

/**
 * Hitung bonus streak dari array hasil soal.
 * Setiap `interval` jawaban benar berturut-turut = +bonus poin.
 */
export function calculateStreakBonus(
  soalResults: Array<{ correct: boolean }>,
  config: TebakConfig
): number {
  let streak = 0;
  let totalBonus = 0;
  for (const result of soalResults) {
    if (result.correct) {
      streak++;
      if (streak % config.streak_interval === 0) {
        totalBonus += config.streak_bonus;
      }
    } else {
      streak = 0;
    }
  }
  return totalBonus;
}

/**
 * Hitung skor total: Σ(skor_soal) + Σ(bonus_streak)
 */
export function calculateTotalScore(
  soalResults: Array<{ correct: boolean; hints_used: number }>,
  config: TebakConfig
): number {
  const soalTotal = soalResults.reduce(
    (sum, r) => sum + calculateSoalScore(r.hints_used, r.correct, config),
    0
  );
  const streakBonus = calculateStreakBonus(soalResults, config);
  return soalTotal + streakBonus;
}

/** Kembalikan rank berdasarkan skor total */
export function getTebakRank(totalScore: number): typeof TEBAK_RANKS[number] {
  return (
    TEBAK_RANKS.find((r) => totalScore >= r.min && totalScore <= r.max) ??
    TEBAK_RANKS[TEBAK_RANKS.length - 1]
  );
}
