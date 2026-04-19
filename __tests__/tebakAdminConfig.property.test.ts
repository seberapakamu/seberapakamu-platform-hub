// Feature: anime-character-quiz, Property 10: Validasi rentang konfigurasi admin

import * as fc from "fast-check";
import { validateConfig, isSoalCountValid } from "../lib/tebakAdminValidation";
import type { ConfigForm } from "../lib/tebakAdminValidation";

/**
 * Helper: build a valid ConfigForm with a specific soal_count string.
 */
function makeForm(soalCount: string): ConfigForm {
  return {
    soal_count: soalCount,
    score_hint_1: "100",
    score_hint_2: "75",
    score_hint_3: "50",
    score_hint_4: "25",
    streak_bonus: "50",
    streak_interval: "3",
  };
}

describe("Property 10: Validasi Rentang Konfigurasi Admin", () => {
  /**
   * Validates: Requirements 10.1
   * Nilai jumlah soal dalam rentang 5–20 harus diterima (tidak ada error soal_count).
   */
  it("soal_count 5–20 harus diterima tanpa error", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }),
        (count) => {
          const errors = validateConfig(makeForm(String(count)));
          return errors.soal_count === undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 10.5
   * Nilai jumlah soal < 5 harus ditolak dengan pesan error.
   */
  it("soal_count < 5 harus ditolak", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 4 }),
        (count) => {
          const errors = validateConfig(makeForm(String(count)));
          return typeof errors.soal_count === "string" && errors.soal_count.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 10.5
   * Nilai jumlah soal > 20 harus ditolak dengan pesan error.
   */
  it("soal_count > 20 harus ditolak", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 21, max: 1000 }),
        (count) => {
          const errors = validateConfig(makeForm(String(count)));
          return typeof errors.soal_count === "string" && errors.soal_count.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 10.1, 10.5
   * isSoalCountValid: nilai 5–20 harus true, di luar rentang harus false.
   */
  it("isSoalCountValid: 5–20 → true, di luar rentang → false", () => {
    // Valid range
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }),
        (count) => isSoalCountValid(count) === true
      ),
      { numRuns: 100 }
    );

    // Below range
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 4 }),
        (count) => isSoalCountValid(count) === false
      ),
      { numRuns: 100 }
    );

    // Above range
    fc.assert(
      fc.property(
        fc.integer({ min: 21, max: 1000 }),
        (count) => isSoalCountValid(count) === false
      ),
      { numRuns: 100 }
    );
  });
});
