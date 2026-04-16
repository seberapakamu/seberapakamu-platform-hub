/**
 * Unit tests for scoring engine
 * Requirements: 3.9, 3.10, 3.11
 */
import { calculateScore, getTier, CATEGORY_WEIGHTS, TIERS } from "../lib/scoring";
import type { Question } from "../lib/store/quizStore";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeQuestion(
  id: number,
  kategori: Question["kategori"],
  bobot: number,
  maxNilai: number
): Question {
  const opsi_jawaban =
    maxNilai === 1
      ? [
          { nilai: 0, label: "Tidak" },
          { nilai: 1, label: "Ya" },
        ]
      : Array.from({ length: maxNilai }, (_, i) => ({
          nilai: i + 1,
          label: `Opsi ${i + 1}`,
        }));

  return {
    id,
    teks: `Pertanyaan ${id}`,
    tipe: maxNilai === 1 ? "ya_tidak" : "skala_1_5",
    kategori,
    bobot,
    opsi_jawaban,
  };
}

// ─── calculateScore ──────────────────────────────────────────────────────────

describe("calculateScore - edge cases", () => {
  it("returns 0 when questions array is empty", () => {
    expect(calculateScore({}, [])).toBe(0);
  });

  it("returns 0 when all answers are 0 (ya_tidak questions)", () => {
    const questions: Question[] = [
      makeQuestion(1, "Tonton", 1, 1),
      makeQuestion(2, "Koleksi", 1, 1),
    ];
    const answers = { 1: 0, 2: 0 };
    expect(calculateScore(answers, questions)).toBe(0);
  });

  it("returns 0 when answers object is empty (unanswered treated as 0)", () => {
    const questions: Question[] = [makeQuestion(1, "Genre", 1, 5)];
    expect(calculateScore({}, questions)).toBe(0);
  });
});

describe("calculateScore - all answers at maximum", () => {
  it("returns 100 when all ya_tidak questions answered Ya (1)", () => {
    const questions: Question[] = [
      makeQuestion(1, "Tonton", 1, 1),
      makeQuestion(2, "Koleksi", 1, 1),
      makeQuestion(3, "Bahasa", 1, 1),
    ];
    const answers = { 1: 1, 2: 1, 3: 1 };
    expect(calculateScore(answers, questions)).toBe(100);
  });

  it("returns 100 when all skala_1_5 questions answered at max (5)", () => {
    const questions: Question[] = [
      makeQuestion(1, "Genre", 1, 5),
      makeQuestion(2, "Komunitas", 1, 5),
    ];
    const answers = { 1: 5, 2: 5 };
    expect(calculateScore(answers, questions)).toBe(100);
  });
});

describe("calculateScore - mixed answers", () => {
  it("returns ~50 for a single skala_1_5 question answered at midpoint (3 of 5)", () => {
    const questions: Question[] = [makeQuestion(1, "Genre", 1, 5)];
    // effectiveWeight = 1.0 * 1 = 1; total = 1*3 = 3; max = 1*5 = 5; score = 3/5*100 = 60
    const answers = { 1: 3 };
    expect(calculateScore(answers, questions)).toBe(60);
  });

  it("calculates correctly with mixed ya_tidak and skala_1_5 questions", () => {
    // ya_tidak: bobot=1, kategori=Genre(1.0) → effectiveWeight=1, max=1
    // skala_1_5: bobot=1, kategori=Genre(1.0) → effectiveWeight=1, max=5
    // answers: q1=1, q2=3
    // total = 1*1 + 1*3 = 4; max = 1*1 + 1*5 = 6; score = 4/6*100 ≈ 66.7
    const questions: Question[] = [
      makeQuestion(1, "Genre", 1, 1),
      makeQuestion(2, "Genre", 1, 5),
    ];
    const answers = { 1: 1, 2: 3 };
    expect(calculateScore(answers, questions)).toBeCloseTo(66.7, 0);
  });
});

// ─── calculateScore - category weights (Requirement 3.10) ───────────────────

describe("calculateScore - category weights applied correctly", () => {
  it("Koleksi (1.5) scores higher than Genre (1.0) for identical answers", () => {
    const koleksiQ: Question[] = [makeQuestion(1, "Koleksi", 1, 1)];
    const genreQ: Question[] = [makeQuestion(1, "Genre", 1, 1)];
    const answers = { 1: 1 };
    // Both should be 100% since it's a single question answered at max
    expect(calculateScore(answers, koleksiQ)).toBe(100);
    expect(calculateScore(answers, genreQ)).toBe(100);
  });

  it("category weight affects score when mixing answered and unanswered questions", () => {
    // Two questions: one Koleksi(1.5) answered, one Genre(1.0) unanswered
    // total = 1.5*1*1 + 1.0*1*0 = 1.5; max = 1.5*1 + 1.0*1 = 2.5; score = 1.5/2.5*100 = 60
    const questions: Question[] = [
      makeQuestion(1, "Koleksi", 1, 1),
      makeQuestion(2, "Genre", 1, 1),
    ];
    const answers = { 1: 1 }; // only Koleksi answered
    expect(calculateScore(answers, questions)).toBe(60);
  });

  it("Bahasa (0.8) has less weight than Komunitas (1.3)", () => {
    // Same answer (max), but Komunitas should contribute more to a mixed score
    // q1=Bahasa bobot=1 max=1, q2=Komunitas bobot=1 max=1
    // Only q1 answered: total=0.8*1=0.8; max=0.8+1.3=2.1; score=0.8/2.1*100≈38.1
    // Only q2 answered: total=1.3*1=1.3; max=2.1; score=1.3/2.1*100≈61.9
    const questions: Question[] = [
      makeQuestion(1, "Bahasa", 1, 1),
      makeQuestion(2, "Komunitas", 1, 1),
    ];
    const onlyBahasa = calculateScore({ 1: 1 }, questions);
    const onlyKomunitas = calculateScore({ 2: 1 }, questions);
    expect(onlyKomunitas).toBeGreaterThan(onlyBahasa);
  });

  it("CATEGORY_WEIGHTS has correct values per requirement 3.10", () => {
    expect(CATEGORY_WEIGHTS.Tonton).toBe(1.2);
    expect(CATEGORY_WEIGHTS.Koleksi).toBe(1.5);
    expect(CATEGORY_WEIGHTS.Bahasa).toBe(0.8);
    expect(CATEGORY_WEIGHTS.Komunitas).toBe(1.3);
    expect(CATEGORY_WEIGHTS.Genre).toBe(1.0);
  });
});

// ─── getTier - boundary values (Requirement 3.11) ───────────────────────────

describe("getTier - tier boundaries", () => {
  it("score 0 → Tier 1 (Casual Viewer)", () => {
    const tier = getTier(0);
    expect(tier.tier).toBe(1);
    expect(tier.title).toBe("Casual Viewer");
  });

  it("score 19.99 → Tier 1 (Casual Viewer)", () => {
    expect(getTier(19.99).tier).toBe(1);
  });

  it("score 20 → Tier 2 (Anime Enjoyer)", () => {
    const tier = getTier(20);
    expect(tier.tier).toBe(2);
    expect(tier.title).toBe("Anime Enjoyer");
  });

  it("score 39.99 → Tier 2 (Anime Enjoyer)", () => {
    expect(getTier(39.99).tier).toBe(2);
  });

  it("score 40 → Tier 3 (Wibu Terlatih)", () => {
    const tier = getTier(40);
    expect(tier.tier).toBe(3);
    expect(tier.title).toBe("Wibu Terlatih");
  });

  it("score 59.99 → Tier 3 (Wibu Terlatih)", () => {
    expect(getTier(59.99).tier).toBe(3);
  });

  it("score 60 → Tier 4 (Wibu Veteran)", () => {
    const tier = getTier(60);
    expect(tier.tier).toBe(4);
    expect(tier.title).toBe("Wibu Veteran");
  });

  it("score 79.99 → Tier 4 (Wibu Veteran)", () => {
    expect(getTier(79.99).tier).toBe(4);
  });

  it("score 80 → Tier 5 (Sepuh Wibu)", () => {
    const tier = getTier(80);
    expect(tier.tier).toBe(5);
    expect(tier.title).toBe("Sepuh Wibu");
  });

  it("score 100 → Tier 5 (Sepuh Wibu)", () => {
    const tier = getTier(100);
    expect(tier.tier).toBe(5);
    expect(tier.title).toBe("Sepuh Wibu");
  });
});

describe("getTier - tier structure", () => {
  it("returns exactly 5 tiers", () => {
    expect(TIERS).toHaveLength(5);
  });

  it("every tier has required fields: tier, title, emoji, description, minScore, maxScore", () => {
    for (const t of TIERS) {
      expect(t.tier).toBeGreaterThanOrEqual(1);
      expect(typeof t.title).toBe("string");
      expect(typeof t.emoji).toBe("string");
      expect(typeof t.description).toBe("string");
      expect(typeof t.minScore).toBe("number");
      expect(typeof t.maxScore).toBe("number");
    }
  });

  it("tier ranges are contiguous and cover 0–100", () => {
    const sorted = [...TIERS].sort((a, b) => a.minScore - b.minScore);
    expect(sorted[0].minScore).toBe(0);
    expect(sorted[sorted.length - 1].maxScore).toBe(100);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].minScore).toBeGreaterThan(sorted[i - 1].minScore);
    }
  });
});
