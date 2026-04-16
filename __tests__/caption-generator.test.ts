/**
 * Unit tests for caption generator
 * Requirements: 6.3, 6.4
 */
import {
  generateCaption,
  getRandomStyle,
  type CaptionStyle,
} from "../lib/captionGenerator";
import { TIERS } from "../lib/scoring";

const ALL_STYLES: CaptionStyle[] = ["roast", "praise", "dramatis", "meme"];

// ─── Output format ───────────────────────────────────────────────────────────

describe("generateCaption - output format", () => {
  it("result contains caption and hashtags separated by \\n\\n", () => {
    const result = generateCaption(TIERS[0], "praise");
    const parts = result.split("\n\n");
    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  it("hashtag part starts with #", () => {
    const result = generateCaption(TIERS[2], "meme");
    const hashtagPart = result.split("\n\n").slice(-1)[0];
    expect(hashtagPart).toMatch(/^#/);
  });
});

// ─── Each style produces different text ──────────────────────────────────────

describe("generateCaption - styles produce different text", () => {
  it("all 4 styles for tier 1 do not all produce identical output", () => {
    const outputs = ALL_STYLES.map((style) => generateCaption(TIERS[0], style));
    const unique = new Set(outputs);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("all 4 styles for tier 3 do not all produce identical output", () => {
    const outputs = ALL_STYLES.map((style) => generateCaption(TIERS[2], style));
    const unique = new Set(outputs);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("all 4 styles for tier 5 do not all produce identical output", () => {
    const outputs = ALL_STYLES.map((style) => generateCaption(TIERS[4], style));
    const unique = new Set(outputs);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ─── Hashtags match the tier ─────────────────────────────────────────────────

const EXPECTED_HASHTAGS: Record<number, string[]> = {
  1: ["#CasualViewer", "#WibuPemula", "#SeberapaWibu", "#WibuQuiz"],
  2: ["#AnimeEnjoyer", "#WibuMuda", "#SeberapaWibu", "#WibuQuiz", "#AnimeLovers"],
  3: ["#WibuTerlatih", "#WibuGarisLurus", "#SeberapaWibu", "#WibuQuiz", "#OtakuIndonesia"],
  4: ["#WibuVeteran", "#EnsiklopediaAnime", "#SeberapaWibu", "#WibuQuiz", "#OtakuSejati"],
  5: ["#SepuhWibu", "#WibuLegend", "#SeberapaWibu", "#WibuQuiz", "#OtakuMaster", "#WibuPanutanBangsa"],
};

describe("generateCaption - hashtags match tier", () => {
  for (const tier of TIERS) {
    it(`tier ${tier.tier} output contains all expected hashtags`, () => {
      const result = generateCaption(tier, "praise");
      for (const tag of EXPECTED_HASHTAGS[tier.tier]) {
        expect(result).toContain(tag);
      }
    });
  }
});

// ─── All tiers work without throwing ─────────────────────────────────────────

describe("generateCaption - all tiers work", () => {
  for (const tier of TIERS) {
    it(`tier ${tier.tier} does not throw for any style`, () => {
      for (const style of ALL_STYLES) {
        expect(() => generateCaption(tier, style)).not.toThrow();
      }
    });
  }
});

// ─── getRandomStyle ───────────────────────────────────────────────────────────

describe("getRandomStyle", () => {
  it("returns one of the 4 valid styles", () => {
    for (let i = 0; i < 20; i++) {
      expect(ALL_STYLES).toContain(getRandomStyle());
    }
  });
});
