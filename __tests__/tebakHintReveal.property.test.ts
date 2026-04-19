import * as fc from "fast-check";
import type { AnimeCharacter } from "../lib/types/tebak";

// Feature: anime-character-quiz, Property 3: Urutan petunjuk selalu konsisten

/**
 * Mirrors the hint-reveal logic from TebakHintReveal.tsx:
 * - Hint 1 (siluet)    : always visible (hintsRevealed >= 1)
 * - Hint 2 (kutipan)   : visible when hintsRevealed >= 2
 * - Hint 3 (kekuatan)  : visible when hintsRevealed >= 3
 * - Hint 4 (asal_anime): visible when hintsRevealed >= 4
 *
 * Returns the ordered list of hint keys that are currently visible.
 */
function getVisibleHints(hintsRevealed: number): string[] {
  const order: string[] = ["siluet", "kutipan", "kekuatan", "asal_anime"];
  return order.filter((_, idx) => hintsRevealed >= idx + 1);
}

// ─── Arbitrary generators ────────────────────────────────────────────────────

const animeCharacterArb = fc.record<AnimeCharacter>({
  id: fc.integer({ min: 1, max: 10_000 }),
  nama: fc.string({ minLength: 1, maxLength: 50 }),
  asal_anime: fc.string({ minLength: 1, maxLength: 100 }),
  siluet_url: fc.webUrl(),
  kutipan: fc.string({ minLength: 1, maxLength: 200 }),
  kekuatan: fc.string({ minLength: 1, maxLength: 200 }),
  deskripsi: fc.string({ minLength: 0, maxLength: 300 }),
  aktif: fc.boolean(),
});

const hintsRevealedArb = fc.integer({ min: 1, max: 4 });

// ─── Property 3 tests ────────────────────────────────────────────────────────

describe("Property 3: Urutan Petunjuk Selalu Konsisten", () => {
  /**
   * Validates: Requirements 3.3
   * Untuk semua karakter valid, petunjuk pertama yang terungkap harus selalu siluet.
   * Siluet selalu terlihat saat hintsRevealed >= 1 (yaitu selalu).
   */
  it("petunjuk pertama yang terungkap selalu siluet", () => {
    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        return visible[0] === "siluet";
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Kutipan hanya terungkap setelah siluet (hintsRevealed >= 2 → siluet sudah ada).
   */
  it("kutipan hanya muncul setelah siluet sudah terungkap", () => {
    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        if (visible.includes("kutipan")) {
          return visible.includes("siluet");
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Kekuatan hanya terungkap setelah kutipan sudah ada.
   */
  it("kekuatan hanya muncul setelah kutipan sudah terungkap", () => {
    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        if (visible.includes("kekuatan")) {
          return visible.includes("kutipan");
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Asal anime hanya terungkap setelah kekuatan sudah ada.
   */
  it("asal_anime hanya muncul setelah kekuatan sudah terungkap", () => {
    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        if (visible.includes("asal_anime")) {
          return visible.includes("kekuatan");
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Urutan petunjuk yang terungkap harus selalu mengikuti urutan baku:
   * siluet → kutipan → kekuatan → asal_anime (tidak ada yang dilewati atau dibalik).
   */
  it("urutan petunjuk yang terungkap selalu mengikuti urutan baku", () => {
    const EXPECTED_ORDER = ["siluet", "kutipan", "kekuatan", "asal_anime"];

    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        // visible harus merupakan prefix dari EXPECTED_ORDER
        if (visible.length > EXPECTED_ORDER.length) return false;
        return visible.every((hint, idx) => hint === EXPECTED_ORDER[idx]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Jumlah petunjuk yang terungkap harus tepat sama dengan nilai hintsRevealed.
   * Tidak ada petunjuk yang dilewati.
   */
  it("jumlah petunjuk terungkap tepat sama dengan hintsRevealed (tidak ada yang dilewati)", () => {
    fc.assert(
      fc.property(animeCharacterArb, hintsRevealedArb, (_character, hintsRevealed) => {
        const visible = getVisibleHints(hintsRevealed);
        return visible.length === hintsRevealed;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.3
   * Untuk setiap nilai hintsRevealed yang lebih besar, himpunan petunjuk yang terungkap
   * harus merupakan superset dari nilai yang lebih kecil (tidak ada petunjuk yang hilang).
   */
  it("menambah hintsRevealed tidak pernah menyembunyikan petunjuk yang sudah terungkap", () => {
    fc.assert(
      fc.property(
        animeCharacterArb,
        fc.integer({ min: 1, max: 3 }),
        (_character, n) => {
          const visibleN = getVisibleHints(n);
          const visibleNPlus1 = getVisibleHints(n + 1);
          // Semua petunjuk di visibleN harus ada di visibleNPlus1
          return visibleN.every((hint) => visibleNPlus1.includes(hint));
        }
      ),
      { numRuns: 100 }
    );
  });
});
