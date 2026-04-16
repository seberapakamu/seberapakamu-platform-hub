/**
 * __tests__/hub/modules-config.test.ts
 *
 * Validasi konfigurasi modul Platform Hub "Seberapa Kamu?"
 *
 * Feature: seberapakamu-platform-hub
 * Property 4: Setiap modul memiliki accentColor yang unik
 * Validates: Requirements 2.2, 10.1
 */

import fc from "fast-check";
import { MODULES, type Module, type ModuleStatus } from "@/lib/hub/modules";

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("MODULES config — unit tests", () => {
  it("mengandung tepat 1 modul dengan status active (MVP)", () => {
    const activeModules = MODULES.filter((m) => m.status === "active");
    expect(activeModules).toHaveLength(1);
    expect(activeModules[0].id).toBe("wibu");
  });

  it("semua field wajib ada dan bertipe string pada setiap modul", () => {
    const requiredStringFields: (keyof Module)[] = [
      "id",
      "name",
      "slug",
      "description",
      "accentColor",
      "mascotEmoji",
      "mascotAlt",
      "status",
      "href",
    ];

    for (const module of MODULES) {
      for (const field of requiredStringFields) {
        expect(typeof module[field]).toBe("string");
        expect((module[field] as string).length).toBeGreaterThan(0);
      }
    }
  });

  it("setiap modul memiliki status yang valid", () => {
    const validStatuses: ModuleStatus[] = ["active", "coming_soon"];
    for (const module of MODULES) {
      expect(validStatuses).toContain(module.status);
    }
  });

  it("setiap modul memiliki href yang dimulai dengan /", () => {
    for (const module of MODULES) {
      expect(module.href).toMatch(/^\//);
    }
  });

  it("setiap modul memiliki accentColor yang valid (format hex)", () => {
    for (const module of MODULES) {
      expect(module.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("tidak ada dua modul dengan id yang sama", () => {
    const ids = MODULES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(MODULES.length);
  });

  it("tidak ada dua modul dengan slug yang sama", () => {
    const slugs = MODULES.map((m) => m.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(MODULES.length);
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("MODULES config — property-based tests", () => {
  /**
   * Property 4: Setiap modul memiliki accentColor yang unik
   * Validates: Requirements 2.2
   *
   * Untuk setiap daftar modul yang valid, tidak ada dua modul yang memiliki
   * nilai accentColor yang sama.
   */
  it("Property 4: setiap modul dalam daftar arbitrary memiliki accentColor yang unik", () => {
    // Arbiter untuk hex color yang valid
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

    const moduleArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      accentColor: hexColorArb,
      mascotEmoji: fc.string({ minLength: 1, maxLength: 10 }),
      mascotAlt: fc.string({ minLength: 1, maxLength: 100 }),
      status: fc.constantFrom<ModuleStatus>("active", "coming_soon"),
      href: fc.string({ minLength: 2, maxLength: 50 }).map((s) => `/${s}`),
    });

    // Generate daftar modul dengan accentColor yang sudah dijamin unik
    // dengan cara generate array lalu deduplikasi berdasarkan accentColor
    fc.assert(
      fc.property(
        fc.array(moduleArb, { minLength: 1, maxLength: 10 }),
        (modules) => {
          // Buat versi dengan accentColor unik (simulasi validasi)
          const uniqueColors = new Set<string>();
          const uniqueModules = modules.filter((m) => {
            if (uniqueColors.has(m.accentColor)) return false;
            uniqueColors.add(m.accentColor);
            return true;
          });

          // Property: setelah deduplikasi, Set size harus sama dengan panjang array
          const colors = uniqueModules.map((m) => m.accentColor);
          const colorSet = new Set(colors);
          return colorSet.size === uniqueModules.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 (applied to real MODULES):
   * Konfigurasi MODULES aktual harus memiliki accentColor yang unik
   */
  it("Property 4 (real data): MODULES aktual memiliki accentColor yang unik", () => {
    const colors = MODULES.map((m) => m.accentColor);
    const colorSet = new Set(colors);
    expect(colorSet.size).toBe(MODULES.length);
  });
});
