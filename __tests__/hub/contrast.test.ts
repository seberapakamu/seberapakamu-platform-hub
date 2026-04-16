/**
 * __tests__/hub/contrast.test.ts
 *
 * Tests contrast ratio warna Hub Landing Page (WCAG AA compliance)
 *
 * Feature: seberapakamu-platform-hub
 * Property 8: Contrast ratio teks hub memenuhi WCAG AA
 * Validates: Requirements 9.2
 */

import fc from "fast-check";

// ─── WCAG Contrast Ratio Helper ───────────────────────────────────────────────

/**
 * Mengkonversi nilai hex color ke komponen RGB (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Mengkonversi nilai sRGB (0-255) ke nilai linear untuk kalkulasi luminance.
 * Menggunakan formula WCAG 2.1.
 */
function sRGBToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Menghitung relative luminance dari sebuah warna hex.
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * Sesuai WCAG 2.1 Success Criterion 1.4.3.
 */
function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const R = sRGBToLinear(r);
  const G = sRGBToLinear(g);
  const B = sRGBToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Menghitung contrast ratio antara dua warna hex.
 * Formula: (L1 + 0.05) / (L2 + 0.05) di mana L1 >= L2
 * Sesuai WCAG 2.1 Success Criterion 1.4.3.
 *
 * @param hex1 - Warna pertama (teks atau background)
 * @param hex2 - Warna kedua (teks atau background)
 * @returns Contrast ratio (1:1 hingga 21:1)
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Hub Color Pairs ──────────────────────────────────────────────────────────

/**
 * Pasangan warna teks/background yang digunakan di Hub Landing Page.
 * Sesuai dengan CSS variables yang didefinisikan di app/(hub)/layout.tsx.
 */
interface ColorPair {
  text: string;
  bg: string;
  description: string;
}

const HUB_COLOR_PAIRS: ColorPair[] = [
  {
    text: "#F0F0FF",
    bg: "#0F0F1A",
    description: "Teks utama (--hub-text) di atas background utama (--hub-bg)",
  },
  {
    text: "#9090B0",
    bg: "#0F0F1A",
    description:
      "Teks muted (--hub-text-muted) di atas background utama (--hub-bg)",
  },
  {
    text: "#FFFFFF",
    bg: "#1A1A2E",
    description:
      "Teks bold (--hub-text-bold) di atas background card (--hub-bg-card)",
  },
  {
    text: "#F0F0FF",
    bg: "#1A1A2E",
    description:
      "Teks utama (--hub-text) di atas background card (--hub-bg-card)",
  },
];

// WCAG AA minimum contrast ratio untuk teks normal
const WCAG_AA_MIN_RATIO = 4.5;

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("calculateContrastRatio — unit tests", () => {
  it("mengembalikan 21 untuk hitam (#000000) vs putih (#FFFFFF)", () => {
    const ratio = calculateContrastRatio("#000000", "#FFFFFF");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("mengembalikan 1 untuk warna yang sama", () => {
    const ratio = calculateContrastRatio("#FF9A9E", "#FF9A9E");
    expect(ratio).toBeCloseTo(1, 5);
  });

  it("simetris: ratio(A, B) === ratio(B, A)", () => {
    const ratio1 = calculateContrastRatio("#F0F0FF", "#0F0F1A");
    const ratio2 = calculateContrastRatio("#0F0F1A", "#F0F0FF");
    expect(ratio1).toBeCloseTo(ratio2, 10);
  });

  it("selalu mengembalikan nilai antara 1 dan 21", () => {
    const pairs = [
      ["#000000", "#FFFFFF"],
      ["#FF0000", "#00FF00"],
      ["#0000FF", "#FFFF00"],
      ["#808080", "#808080"],
    ];
    pairs.forEach(([c1, c2]) => {
      const ratio = calculateContrastRatio(c1, c2);
      expect(ratio).toBeGreaterThanOrEqual(1);
      expect(ratio).toBeLessThanOrEqual(21);
    });
  });
});

describe("Hub color contrast — unit tests", () => {
  it.each(HUB_COLOR_PAIRS)(
    "pasangan '$description' memiliki contrast ratio ≥ 4.5:1",
    ({ text, bg }) => {
      const ratio = calculateContrastRatio(text, bg);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_RATIO);
    }
  );

  it("semua pasangan warna hub memenuhi WCAG AA (≥ 4.5:1)", () => {
    HUB_COLOR_PAIRS.forEach(({ text, bg, description }) => {
      const ratio = calculateContrastRatio(text, bg);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_RATIO);
    });
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("Hub color contrast — property-based tests", () => {
  /**
   * Property 8: Contrast ratio teks hub memenuhi WCAG AA
   * Validates: Requirements 9.2
   *
   * Untuk setiap pasangan warna yang digunakan di hub,
   * contrast ratio harus ≥ 4.5:1.
   */
  it("Property 8: setiap pasangan warna hub memiliki contrast ratio ≥ 4.5:1", () => {
    fc.assert(
      fc.property(fc.constantFrom(...HUB_COLOR_PAIRS), ({ text, bg }) => {
        const ratio = calculateContrastRatio(text, bg);
        return ratio >= WCAG_AA_MIN_RATIO;
      }),
      { numRuns: HUB_COLOR_PAIRS.length }
    );
  });

  /**
   * Property: calculateContrastRatio selalu menghasilkan nilai dalam range [1, 21]
   */
  it("calculateContrastRatio selalu menghasilkan nilai dalam range [1, 21] untuk input hex valid", () => {
    const hexColorArb = fc
      .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
      )
      .map(
        ([r, g, b]) =>
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      );

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio = calculateContrastRatio(color1, color2);
        return ratio >= 1 && ratio <= 21;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * Property: calculateContrastRatio bersifat simetris
   */
  it("calculateContrastRatio bersifat simetris: ratio(A, B) === ratio(B, A)", () => {
    const hexColorArb = fc
      .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
      )
      .map(
        ([r, g, b]) =>
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      );

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio1 = calculateContrastRatio(color1, color2);
        const ratio2 = calculateContrastRatio(color2, color1);
        return Math.abs(ratio1 - ratio2) < 1e-10;
      }),
      { numRuns: 200 }
    );
  });
});
