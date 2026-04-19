// Feature: anime-character-quiz, Property 9: Autocomplete hanya muncul saat input >= 2 karakter

import * as fc from "fast-check";

/**
 * Mirrors the normalize function from TebakAnswerInput.tsx
 */
function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Mirrors the fuzzyMatch function from TebakAnswerInput.tsx
 */
function fuzzyMatch(query: string, target: string): boolean {
  const q = normalize(query);
  const t = normalize(target);
  if (q.length === 0) return false;
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * Mirrors the suggestions computation from TebakAnswerInput.tsx:
 *   const trimmed = value.trim();
 *   const suggestions =
 *     trimmed.length >= 2
 *       ? allCharacterNames.filter((name) => fuzzyMatch(trimmed, name)).slice(0, 8)
 *       : [];
 */
function getSuggestions(value: string, allCharacterNames: string[]): string[] {
  const trimmed = value.trim();
  return trimmed.length >= 2
    ? allCharacterNames.filter((name) => fuzzyMatch(trimmed, name)).slice(0, 8)
    : [];
}

// ─── Arbitrary generators ────────────────────────────────────────────────────

/** Generates a non-empty list of character names (1–20 names, each 2–50 chars) */
const characterNamesArb = fc.array(
  fc.string({ minLength: 2, maxLength: 50 }),
  { minLength: 1, maxLength: 20 }
);

/** Generates input strings whose trimmed length is 0 (empty or whitespace-only) */
const zeroLengthTrimmedArb = fc.oneof(
  fc.constant(""),
  fc.string({ unit: fc.constantFrom(" ", "\t", "\n"), minLength: 1, maxLength: 10 })
);

/** Generates input strings whose trimmed length is exactly 1 */
const oneLengthTrimmedArb = fc
  .string({ minLength: 1, maxLength: 1 })
  .map((c) => c.trim())
  .filter((c) => c.length === 1)
  .chain((c) =>
    fc
      .tuple(
        fc.string({ unit: fc.constantFrom(" ", "\t"), minLength: 0, maxLength: 5 }),
        fc.string({ unit: fc.constantFrom(" ", "\t"), minLength: 0, maxLength: 5 })
      )
      .map(([pre, post]) => `${pre}${c}${post}`)
  );

/** Generates input strings whose trimmed length is >= 2 */
const twoOrMoreLengthTrimmedArb = fc
  .string({ minLength: 2, maxLength: 30 })
  .filter((s) => s.trim().length >= 2);

// ─── Property 9 tests ────────────────────────────────────────────────────────

describe("Property 9: Autocomplete Hanya Muncul Saat Input ≥ 2 Karakter", () => {
  /**
   * Validates: Requirements 3.5
   * Input dengan trimmed length = 0 tidak boleh menghasilkan saran apapun,
   * terlepas dari daftar karakter yang tersedia.
   */
  it("input trimmed length 0 tidak pernah menghasilkan saran", () => {
    fc.assert(
      fc.property(zeroLengthTrimmedArb, characterNamesArb, (input, names) => {
        const suggestions = getSuggestions(input, names);
        return suggestions.length === 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.5
   * Input dengan trimmed length = 1 tidak boleh menghasilkan saran apapun,
   * terlepas dari daftar karakter yang tersedia.
   */
  it("input trimmed length 1 tidak pernah menghasilkan saran", () => {
    fc.assert(
      fc.property(oneLengthTrimmedArb, characterNamesArb, (input, names) => {
        const suggestions = getSuggestions(input, names);
        return suggestions.length === 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.5
   * Input dengan trimmed length >= 2 BOLEH menghasilkan saran (tidak diblokir oleh panjang).
   * Ketika daftar karakter mengandung nama yang cocok, saran harus muncul.
   * Test ini memverifikasi bahwa gate panjang tidak memblokir input yang valid.
   */
  it("input trimmed length >= 2 tidak diblokir oleh gate panjang", () => {
    fc.assert(
      fc.property(twoOrMoreLengthTrimmedArb, (input) => {
        const trimmed = input.trim();
        // Buat daftar karakter yang pasti cocok: gunakan trimmed itu sendiri sebagai nama
        const names = [trimmed, `${trimmed} Extra`, `Prefix ${trimmed}`];
        const suggestions = getSuggestions(input, names);
        // Harus ada setidaknya satu saran karena trimmed cocok dengan dirinya sendiri
        return suggestions.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.5
   * Jumlah saran tidak pernah melebihi 8 (batas slice dari implementasi).
   */
  it("jumlah saran tidak pernah melebihi 8", () => {
    fc.assert(
      fc.property(twoOrMoreLengthTrimmedArb, characterNamesArb, (input, names) => {
        const suggestions = getSuggestions(input, names);
        return suggestions.length <= 8;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 3.5
   * Semua saran yang dikembalikan harus berasal dari daftar karakter yang diberikan.
   */
  it("semua saran berasal dari daftar karakter yang diberikan", () => {
    fc.assert(
      fc.property(twoOrMoreLengthTrimmedArb, characterNamesArb, (input, names) => {
        const suggestions = getSuggestions(input, names);
        return suggestions.every((s) => names.includes(s));
      }),
      { numRuns: 100 }
    );
  });
});
