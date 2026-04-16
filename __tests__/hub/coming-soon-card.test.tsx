/**
 * __tests__/hub/coming-soon-card.test.tsx
 *
 * Tests untuk komponen ComingSoonCard
 *
 * Feature: seberapakamu-platform-hub
 * Property 2: Setiap modul coming_soon memiliki card yang non-interaktif dengan label "Segera Hadir"
 * Validates: Requirements 1.5, 2.4, 10.3
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import fc from "fast-check";
import ComingSoonCard from "@/components/hub/ComingSoonCard";
import { MODULES, type Module, type ModuleStatus } from "@/lib/hub/modules";

// Modul bucin sebagai fixture utama (coming_soon)
const bucinModule = MODULES.find((m) => m.id === "bucin")!;

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("ComingSoonCard — unit tests", () => {
  it("tidak memiliki elemen <a> di dalam card", () => {
    const { container } = render(<ComingSoonCard module={bucinModule} />);
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(0);
  });

  it("menampilkan teks 'Segera Hadir'", () => {
    render(<ComingSoonCard module={bucinModule} />);
    expect(screen.getByText("Segera Hadir")).toBeInTheDocument();
  });

  it("memiliki aria-disabled='true'", () => {
    const { container } = render(<ComingSoonCard module={bucinModule} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute("aria-disabled", "true");
  });

  it("menampilkan nama modul", () => {
    render(<ComingSoonCard module={bucinModule} />);
    expect(screen.getByText(bucinModule.name)).toBeInTheDocument();
  });

  it("menampilkan mascotEmoji", () => {
    render(<ComingSoonCard module={bucinModule} />);
    expect(screen.getByText(bucinModule.mascotEmoji)).toBeInTheDocument();
  });

  it("tidak memiliki tabIndex (tidak dapat difokus via keyboard)", () => {
    const { container } = render(<ComingSoonCard module={bucinModule} />);
    const card = container.firstChild as HTMLElement;
    // Card tidak boleh memiliki tabIndex positif atau 0
    const tabIndex = card.getAttribute("tabindex");
    expect(tabIndex).toBeNull();
  });

  it("merender <img> dengan alt text jika mascotEmoji adalah path gambar", () => {
    const imageModule: Module = {
      ...bucinModule,
      id: "test-coming-soon-image",
      mascotEmoji: "/images/mascot-bucin.png",
      mascotAlt: "Mascot bucin alt text",
    };
    render(<ComingSoonCard module={imageModule} />);
    const img = screen.getByRole("img", { name: "Mascot bucin alt text" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Mascot bucin alt text");
  });

  it("merender semua modul coming_soon dari MODULES tanpa error", () => {
    const comingSoonModules = MODULES.filter((m) => m.status === "coming_soon");
    expect(comingSoonModules.length).toBeGreaterThanOrEqual(2);

    for (const module of comingSoonModules) {
      const { unmount } = render(<ComingSoonCard module={module} />);
      expect(screen.getByText("Segera Hadir")).toBeInTheDocument();
      unmount();
    }
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("ComingSoonCard — property-based tests", () => {
  // Arbiter untuk modul coming_soon arbitrary
  const comingSoonModuleArb = fc.record<Module>({
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
    mascotEmoji: fc.string({ minLength: 1, maxLength: 4 }),
    mascotAlt: fc.string({ minLength: 1, maxLength: 100 }),
    status: fc.constant<ModuleStatus>("coming_soon"),
    href: fc
      .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
      .map((s) => `/${s}`),
    category: fc.option(fc.string({ minLength: 1, maxLength: 30 }), {
      nil: undefined,
    }),
  });

  /**
   * Property 2: Setiap modul coming_soon memiliki card yang non-interaktif
   * dengan label "Segera Hadir"
   * Validates: Requirements 1.5, 2.4, 10.3
   */
  it("Property 2a: tidak ada elemen <a> di dalam ComingSoonCard untuk modul arbitrary", () => {
    fc.assert(
      fc.property(comingSoonModuleArb, (module) => {
        const { unmount, container } = render(
          <ComingSoonCard module={module} />
        );
        const links = container.querySelectorAll("a");
        const hasNoLinks = links.length === 0;
        unmount();
        return hasNoLinks;
      }),
      { numRuns: 100 }
    );
  });

  it("Property 2b: teks 'Segera Hadir' selalu ada di ComingSoonCard untuk modul arbitrary", () => {
    fc.assert(
      fc.property(comingSoonModuleArb, (module) => {
        const { unmount } = render(<ComingSoonCard module={module} />);
        const hasLabel =
          screen.queryByText("Segera Hadir") !== null;
        unmount();
        return hasLabel;
      }),
      { numRuns: 100 }
    );
  });

  it("Property 2c: aria-disabled='true' selalu ada di ComingSoonCard untuk modul arbitrary", () => {
    fc.assert(
      fc.property(comingSoonModuleArb, (module) => {
        const { unmount, container } = render(
          <ComingSoonCard module={module} />
        );
        const card = container.firstChild as HTMLElement;
        const isDisabled = card.getAttribute("aria-disabled") === "true";
        unmount();
        return isDisabled;
      }),
      { numRuns: 100 }
    );
  });
});
