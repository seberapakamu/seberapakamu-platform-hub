import * as fc from "fast-check";
import { calculateSoalScore } from "../lib/tebakScoring";
import type { TebakConfig } from "../lib/types/tebak";

// Feature: anime-character-quiz, Property 4: Skor soal sesuai tabel penilaian

const configArb = fc.record<TebakConfig>({
  soal_count: fc.integer({ min: 5, max: 20 }),
  score_hint_1: fc.nat(),
  score_hint_2: fc.nat(),
  score_hint_3: fc.nat(),
  score_hint_4: fc.nat(),
  streak_bonus: fc.nat(),
  streak_interval: fc.integer({ min: 1, max: 10 }),
});

describe("Property 4: Skor Soal Sesuai Tabel Penilaian", () => {
  /**
   * Validates: Requirements 4.1
   * Jika jawaban salah, skor selalu 0 terlepas dari jumlah petunjuk yang digunakan.
   */
  it("salah → skor selalu 0", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        configArb,
        (hintsUsed, config) => {
          const score = calculateSoalScore(hintsUsed, false, config);
          return score === 0;
        }
      )
    );
  });

  /**
   * Validates: Requirements 4.1
   * Jika jawaban benar, skor harus sesuai dengan nilai konfigurasi untuk jumlah petunjuk yang digunakan.
   */
  it("benar → skor sesuai config[score_hint_N]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        configArb,
        (hintsUsed, config) => {
          const score = calculateSoalScore(hintsUsed, true, config);
          const expected = config[`score_hint_${hintsUsed}` as keyof TebakConfig] as number;
          return score === expected;
        }
      )
    );
  });
});

// Feature: anime-character-quiz, Property 5: Skor total = jumlah skor soal + bonus streak

import { calculateStreakBonus, calculateTotalScore } from "../lib/tebakScoring";

const soalResultArb = fc.record({
  correct: fc.boolean(),
  hints_used: fc.integer({ min: 1, max: 4 }),
});

describe("Property 5: Skor Total = Jumlah Skor Soal + Bonus Streak", () => {
  /**
   * Validates: Requirements 4.2, 4.3
   * calculateTotalScore harus menghasilkan nilai yang tepat sama dengan
   * Σ(skor_soal) + calculateStreakBonus(results, config)
   */
  it("total score === Σ(skor_soal) + calculateStreakBonus", () => {
    fc.assert(
      fc.property(
        fc.array(soalResultArb),
        configArb,
        (results, config) => {
          const total = calculateTotalScore(results, config);
          const expectedSoalTotal = results.reduce(
            (sum, r) => sum + calculateSoalScore(r.hints_used, r.correct, config),
            0
          );
          const expectedStreakBonus = calculateStreakBonus(results, config);
          return total === expectedSoalTotal + expectedStreakBonus;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: anime-character-quiz, Property 6: Kategorisasi rank selalu lengkap

import { getTebakRank, TEBAK_RANKS } from "../lib/tebakScoring";

describe("Property 6: Kategorisasi Rank Selalu Lengkap", () => {
  /**
   * Validates: Requirements 4.6
   * Untuk semua skor 0–1000, getTebakRank tidak pernah mengembalikan undefined/null,
   * dan rank yang dikembalikan harus sesuai dengan rentang skor yang didefinisikan.
   */
  it("getTebakRank selalu mengembalikan rank valid untuk semua skor 0–1000", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        (score) => {
          const result = getTebakRank(score);
          // Tidak pernah undefined atau null
          if (result == null) return false;
          // Rank yang dikembalikan harus ada di TEBAK_RANKS
          const validRank = TEBAK_RANKS.some((r) => r.rank === result.rank);
          if (!validRank) return false;
          // Skor harus berada dalam rentang min–max rank yang dikembalikan
          return score >= result.min && score <= result.max;
        }
      ),
      { numRuns: 100 }
    );
  });
});
