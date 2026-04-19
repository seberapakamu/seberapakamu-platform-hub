// Feature: anime-character-quiz, Property 8: Hash sesi selalu unik

import * as fc from "fast-check";

/**
 * Validates: Requirements 6.1
 *
 * Untuk semua pasangan sesi yang berbeda, hash yang dihasilkan untuk setiap sesi
 * harus unik — tidak ada dua sesi yang memiliki hash yang sama.
 *
 * crypto.randomUUID() menghasilkan UUID v4 yang secara probabilistik unik.
 * Property ini memverifikasi bahwa dalam kumpulan N hash yang digenerate,
 * tidak ada duplikat.
 */

describe("Property 8: Hash Sesi Selalu Unik", () => {
  /**
   * Validates: Requirements 6.1
   * Dua panggilan crypto.randomUUID() berturut-turut tidak boleh menghasilkan nilai yang sama.
   */
  it("dua hash yang digenerate secara berurutan selalu berbeda", () => {
    fc.assert(
      fc.property(
        // Generate N antara 2–20 untuk jumlah hash yang akan dibandingkan
        fc.integer({ min: 2, max: 20 }),
        (n) => {
          const hashes = Array.from({ length: n }, () => crypto.randomUUID());
          const uniqueHashes = new Set(hashes);
          return uniqueHashes.size === hashes.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 6.1
   * Hash yang digenerate harus berformat UUID v4 yang valid.
   */
  it("setiap hash yang digenerate berformat UUID v4 yang valid", () => {
    const UUID_V4_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          const hashes = Array.from({ length: n }, () => crypto.randomUUID());
          return hashes.every((h) => UUID_V4_REGEX.test(h));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 6.1
   * Dalam batch besar (50 hash), tidak ada duplikat.
   */
  it("batch 50 hash tidak mengandung duplikat", () => {
    const hashes = Array.from({ length: 50 }, () => crypto.randomUUID());
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(50);
  });
});
