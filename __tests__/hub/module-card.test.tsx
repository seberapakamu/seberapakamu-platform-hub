/**
 * __tests__/hub/module-card.test.tsx
 *
 * Tests untuk komponen ModuleCard
 *
 * Feature: seberapakamu-platform-hub
 * Property 1: Setiap modul aktif memiliki card yang dapat diklik
 * Property 5: Setiap ModuleCard menampilkan maskot modul
 * Validates: Requirements 1.1, 1.4, 2.6, 9.3, 9.4, 9.7, 10.2, 10.4
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import fc from "fast-check";
import ModuleCard from "@/components/hub/ModuleCard";
import { MODULES, type Module, type ModuleStatus } from "@/lib/hub/modules";

// Modul wibu sebagai fixture utama
const wibuModule = MODULES.find((m) => m.id === "wibu")!;

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("ModuleCard — unit tests", () => {
  it("menampilkan mascotEmoji di DOM", () => {
    render(<ModuleCard module={wibuModule} />);
    expect(screen.getByText(wibuModule.mascotEmoji)).toBeInTheDocument();
  });

  it("memiliki elemen <a> dengan href yang benar", () => {
    render(<ModuleCard module={wibuModule} />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", wibuModule.href);
  });

  it("memiliki aria-label yang tidak kosong", () => {
    render(<ModuleCard module={wibuModule} />);
    const link = screen.getByRole("link");
    const ariaLabel = link.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  it("memiliki tabIndex={0} pada elemen interaktif", () => {
    render(<ModuleCard module={wibuModule} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("tabindex", "0");
  });

  it("menampilkan nama modul", () => {
    render(<ModuleCard module={wibuModule} />);
    expect(screen.getByText(wibuModule.name)).toBeInTheDocument();
  });

  it("menampilkan deskripsi modul", () => {
    render(<ModuleCard module={wibuModule} />);
    expect(screen.getByText(wibuModule.description)).toBeInTheDocument();
  });

  it("menampilkan badge kategori jika ada", () => {
    render(<ModuleCard module={wibuModule} />);
    if (wibuModule.category) {
      expect(screen.getByText(wibuModule.category)).toBeInTheDocument();
    }
  });

  it("merender <img> dengan alt text jika mascotEmoji adalah path gambar", () => {
    const imageModule: Module = {
      ...wibuModule,
      id: "test-image",
      mascotEmoji: "/images/mascot.png",
      mascotAlt: "Test mascot alt text",
    };
    render(<ModuleCard module={imageModule} />);
    const img = screen.getByRole("img", { name: "Test mascot alt text" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Test mascot alt text");
  });

  it("merender emoji dengan role=img dan aria-label jika mascotEmoji adalah emoji", () => {
    render(<ModuleCard module={wibuModule} />);
    // Emoji dirender sebagai span dengan role="img"
    const emojiEl = screen.getByRole("img", { name: wibuModule.mascotAlt });
    expect(emojiEl).toBeInTheDocument();
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("ModuleCard — property-based tests", () => {
  // Arbiter untuk modul aktif arbitrary
  const activeModuleArb = fc.record<Module>({
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
    status: fc.constant<ModuleStatus>("active"),
    href: fc
      .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
      .map((s) => `/${s}`),
    category: fc.option(fc.string({ minLength: 1, maxLength: 30 }), {
      nil: undefined,
    }),
  });

  /**
   * Property 1: Setiap modul aktif memiliki card yang dapat diklik
   * Validates: Requirements 1.1, 1.4, 10.2, 10.4
   */
  it("Property 1: setiap modul aktif dirender sebagai link yang dapat diklik dengan href yang benar", () => {
    fc.assert(
      fc.property(activeModuleArb, (module) => {
        const { unmount } = render(<ModuleCard module={module} />);
        const link = screen.getByRole("link");
        const hasCorrectHref = link.getAttribute("href") === module.href;
        unmount();
        return hasCorrectHref;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Setiap ModuleCard menampilkan maskot modul
   * Validates: Requirements 2.6
   */
  it("Property 5: setiap ModuleCard menampilkan mascotEmoji di DOM", () => {
    fc.assert(
      fc.property(activeModuleArb, (module) => {
        // Pastikan mascotEmoji bukan path gambar agar dirender sebagai teks
        const emojiModule: Module = {
          ...module,
          mascotEmoji: "🎮", // emoji yang pasti bukan path
        };
        const { unmount, container } = render(
          <ModuleCard module={emojiModule} />
        );
        const hasMascot = container.textContent?.includes("🎮") ?? false;
        unmount();
        return hasMascot;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1 + 5 combined: aria-label tidak kosong untuk setiap modul aktif
   * Validates: Requirements 9.3, 9.7
   */
  it("Property 1+5: setiap ModuleCard memiliki aria-label yang tidak kosong", () => {
    fc.assert(
      fc.property(activeModuleArb, (module) => {
        const { unmount } = render(<ModuleCard module={module} />);
        const link = screen.getByRole("link");
        const ariaLabel = link.getAttribute("aria-label");
        const hasAriaLabel = ariaLabel !== null && ariaLabel.length > 0;
        unmount();
        return hasAriaLabel;
      }),
      { numRuns: 100 }
    );
  });
});
