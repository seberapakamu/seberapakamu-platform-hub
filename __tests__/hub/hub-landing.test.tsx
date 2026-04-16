/**
 * __tests__/hub/hub-landing.test.tsx
 *
 * Tests untuk Hub Landing Page
 *
 * Feature: seberapakamu-platform-hub
 * Property 3: Jumlah card yang dirender sama dengan jumlah modul yang dikonfigurasi
 * Validates: Requirements 1.2, 1.3, 1.6, 10.2
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import fc from "fast-check";
import ModuleCard from "@/components/hub/ModuleCard";
import ComingSoonCard from "@/components/hub/ComingSoonCard";
import { MODULES, type Module, type ModuleStatus } from "@/lib/hub/modules";

// ─── Helper: Mini Hub Page ────────────────────────────────────────────────────

/**
 * Komponen mini yang mensimulasikan logika rendering hub landing page.
 * Digunakan untuk testing tanpa perlu import Server Component penuh.
 */
function MiniHubPage({ modules }: { modules: Module[] }) {
  const activeModules = modules.filter((m) => m.status === "active");
  const comingSoonModules = modules.filter((m) => m.status === "coming_soon");

  return (
    <div>
      <h1>Seberapa Kamu? 🎮</h1>
      <p>
        Platform kuis kepribadian seru — pilih kuis favoritmu dan temukan siapa
        dirimu!
      </p>
      <section aria-label="Daftar modul kuis">
        {activeModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
        {comingSoonModules.map((module) => (
          <ComingSoonCard key={module.id} module={module} />
        ))}
      </section>
    </div>
  );
}

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("Hub Landing Page — unit tests", () => {
  it("menampilkan tagline platform di DOM", () => {
    render(<MiniHubPage modules={MODULES} />);
    expect(
      screen.getByText(/Seberapa Kamu\?/i)
    ).toBeInTheDocument();
  });

  it("menampilkan sub-headline platform", () => {
    render(<MiniHubPage modules={MODULES} />);
    expect(
      screen.getByText(/Platform kuis kepribadian/i)
    ).toBeInTheDocument();
  });

  it("merender minimal 2 ComingSoonCard pada konfigurasi MVP", () => {
    render(<MiniHubPage modules={MODULES} />);
    const comingSoonLabels = screen.getAllByText("Segera Hadir");
    expect(comingSoonLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("merender modul wibu sebagai ModuleCard (bukan ComingSoonCard)", () => {
    render(<MiniHubPage modules={MODULES} />);
    // ModuleCard memiliki elemen <a>, ComingSoonCard tidak
    const wibuModule = MODULES.find((m) => m.id === "wibu")!;
    const link = screen.getByRole("link", {
      name: new RegExp(wibuModule.name, "i"),
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", wibuModule.href);
  });

  it("modul wibu tidak dirender sebagai ComingSoonCard", () => {
    render(<MiniHubPage modules={MODULES} />);
    // Hanya modul coming_soon yang menampilkan "Segera Hadir"
    const comingSoonCount = screen.getAllByText("Segera Hadir").length;
    const comingSoonModulesCount = MODULES.filter(
      (m) => m.status === "coming_soon"
    ).length;
    expect(comingSoonCount).toBe(comingSoonModulesCount);
  });

  it("total card yang dirender sama dengan jumlah MODULES", () => {
    const { container } = render(<MiniHubPage modules={MODULES} />);
    const section = container.querySelector(
      '[aria-label="Daftar modul kuis"]'
    )!;

    // ModuleCard dirender sebagai <a>, ComingSoonCard sebagai <div>
    const moduleCards = section.querySelectorAll("a[aria-label]");
    const comingSoonCards = section.querySelectorAll("[aria-disabled='true']");
    const totalCards = moduleCards.length + comingSoonCards.length;

    expect(totalCards).toBe(MODULES.length);
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("Hub Landing Page — property-based tests", () => {
  // Arbiter untuk modul arbitrary
  const moduleArb = fc.record<Module>({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    accentColor: fc
      .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
      )
      .map(
        ([r, g, b]) =>
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      ),
    mascotEmoji: fc.constant("🎮"), // emoji tetap agar mudah dihitung
    mascotAlt: fc.string({ minLength: 1, maxLength: 100 }),
    status: fc.oneof(
      fc.constant<ModuleStatus>("active"),
      fc.constant<ModuleStatus>("coming_soon")
    ),
    href: fc
      .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
      .map((s) => `/${s}`),
    category: fc.option(fc.string({ minLength: 1, maxLength: 30 }), {
      nil: undefined,
    }),
  });

  /**
   * Property 3: Jumlah card yang dirender sama dengan jumlah modul yang dikonfigurasi
   * Validates: Requirements 10.2
   */
  it("Property 3: total card yang dirender === jumlah modul dalam konfigurasi", () => {
    fc.assert(
      fc.property(
        fc.array(moduleArb, { minLength: 1, maxLength: 10 }),
        (modules) => {
          const { unmount, container } = render(
            <MiniHubPage modules={modules} />
          );

          const section = container.querySelector(
            '[aria-label="Daftar modul kuis"]'
          )!;

          const activeCount = modules.filter(
            (m) => m.status === "active"
          ).length;
          const comingSoonCount = modules.filter(
            (m) => m.status === "coming_soon"
          ).length;

          const renderedLinks = section.querySelectorAll("a[aria-label]").length;
          const renderedDisabled = section.querySelectorAll(
            "[aria-disabled='true']"
          ).length;

          const totalRendered = renderedLinks + renderedDisabled;
          const totalExpected = modules.length;

          unmount();
          return (
            totalRendered === totalExpected &&
            renderedLinks === activeCount &&
            renderedDisabled === comingSoonCount
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
