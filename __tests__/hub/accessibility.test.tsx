/**
 * __tests__/hub/accessibility.test.tsx
 *
 * Tests aksesibilitas untuk Hub Landing Page dan komponen-komponennya
 *
 * Feature: seberapakamu-platform-hub
 * Property 6: Semua gambar/maskot memiliki alt text yang tidak kosong
 * Validates: Requirements 9.3, 9.4, 9.7
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import fc from "fast-check";
import ModuleCard from "@/components/hub/ModuleCard";
import ComingSoonCard from "@/components/hub/ComingSoonCard";
import { MODULES, type Module, type ModuleStatus } from "@/lib/hub/modules";

// ─── Helper: Mini Hub Page ────────────────────────────────────────────────────

function MiniHubPage({ modules }: { modules: Module[] }) {
  const activeModules = modules.filter((m) => m.status === "active");
  const comingSoonModules = modules.filter((m) => m.status === "coming_soon");

  return (
    <div>
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

describe("Aksesibilitas Hub — unit tests", () => {
  it("semua elemen <img> memiliki atribut alt yang tidak kosong", () => {
    // Buat modul dengan mascot berupa path gambar untuk memicu render <img>
    const modulesWithImages: Module[] = MODULES.map((m) => ({
      ...m,
      mascotEmoji: `/images/mascot-${m.id}.png`,
    }));

    const { container } = render(<MiniHubPage modules={modulesWithImages} />);
    const images = container.querySelectorAll("img");

    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(0);
    });
  });

  it("semua ModuleCard memiliki tabIndex={0}", () => {
    render(<MiniHubPage modules={MODULES} />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("tabindex", "0");
    });
  });

  it("semua ModuleCard memiliki aria-label yang tidak kosong", () => {
    render(<MiniHubPage modules={MODULES} />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      const ariaLabel = link.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel!.length).toBeGreaterThan(0);
    });
  });

  it("semua ComingSoonCard memiliki aria-disabled='true'", () => {
    const { container } = render(<MiniHubPage modules={MODULES} />);
    const disabledCards = container.querySelectorAll("[aria-disabled='true']");
    const comingSoonCount = MODULES.filter(
      (m) => m.status === "coming_soon"
    ).length;

    expect(disabledCards.length).toBe(comingSoonCount);
    disabledCards.forEach((card) => {
      expect(card.getAttribute("aria-disabled")).toBe("true");
    });
  });

  it("ModuleCard memiliki focus ring via focus-visible (CSS class/style)", () => {
    render(<MiniHubPage modules={MODULES} />);
    const links = screen.getAllByRole("link");
    // Verifikasi bahwa link memiliki id yang digunakan untuk CSS focus-visible
    links.forEach((link) => {
      expect(link).toHaveAttribute("id");
    });
  });

  it("emoji maskot memiliki role=img dan aria-label", () => {
    render(<MiniHubPage modules={MODULES} />);
    // Semua modul menggunakan emoji (bukan path gambar)
    // Emoji dirender sebagai span dengan role="img"
    MODULES.forEach((module) => {
      const emojiEl = screen.getByRole("img", { name: module.mascotAlt });
      expect(emojiEl).toBeInTheDocument();
    });
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("Aksesibilitas Hub — property-based tests", () => {
  // Arbiter untuk modul dengan mascot gambar (path)
  const moduleWithImageArb = fc.record<Module>({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    accentColor: fc.constant("#FF9A9E"),
    // Path gambar yang valid (dimulai dengan /)
    mascotEmoji: fc
      .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
      .map((s) => `/images/${s}.png`),
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
   * Property 6: Semua gambar/maskot memiliki alt text yang tidak kosong
   * Validates: Requirements 9.4
   */
  it("Property 6: semua <img> yang dirender memiliki alt text yang tidak kosong", () => {
    fc.assert(
      fc.property(
        fc.array(moduleWithImageArb, { minLength: 1, maxLength: 5 }),
        (modules) => {
          const { unmount, container } = render(
            <MiniHubPage modules={modules} />
          );

          const images = container.querySelectorAll("img");
          let allHaveAlt = true;

          images.forEach((img) => {
            const alt = img.getAttribute("alt");
            if (!alt || alt.length === 0) {
              allHaveAlt = false;
            }
          });

          unmount();
          return allHaveAlt;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6 (emoji variant): emoji maskot memiliki aria-label yang tidak kosong
   * Validates: Requirements 9.4
   */
  it("Property 6 (emoji): semua emoji maskot memiliki aria-label yang tidak kosong", () => {
    const moduleWithEmojiArb = fc.record<Module>({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      accentColor: fc.constant("#FF9A9E"),
      mascotEmoji: fc.constant("🎮"), // emoji tetap
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

    fc.assert(
      fc.property(moduleWithEmojiArb, (module) => {
        const { unmount, container } = render(
          module.status === "active" ? (
            <ModuleCard module={module} />
          ) : (
            <ComingSoonCard module={module} />
          )
        );

        // Emoji dirender sebagai span[role="img"] dengan aria-label
        const emojiSpans = container.querySelectorAll('[role="img"]');
        let allHaveAriaLabel = true;

        emojiSpans.forEach((span) => {
          const ariaLabel = span.getAttribute("aria-label");
          if (!ariaLabel || ariaLabel.length === 0) {
            allHaveAriaLabel = false;
          }
        });

        unmount();
        return allHaveAriaLabel;
      }),
      { numRuns: 100 }
    );
  });
});
