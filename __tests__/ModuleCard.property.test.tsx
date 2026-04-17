/**
 * Property-Based Tests for ModuleCard component
 *
 * **Validates: Requirements 1.3, 6.2**
 */

import "@testing-library/jest-dom";
import { render, within } from "@testing-library/react";
import React from "react";
import * as fc from "fast-check";
import ModuleCard from "../components/ModuleCard";
import type { ModuleConfig } from "../lib/modules.config";

// Mock next/link to render a plain anchor so href is accessible in jsdom
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise whitespace the same way Testing Library does */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// ── Arbitraries ────────────────────────────────────────────────────────────────

// A string with at least one non-whitespace character so Testing Library's
// default whitespace normaliser can reliably locate it in the DOM.
const nonBlankStringArb = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

const moduleConfigArb: fc.Arbitrary<ModuleConfig> = fc.record({
  id: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  slug: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  name: nonBlankStringArb,
  description: nonBlankStringArb,
  mascotEmoji: fc
    .string({ minLength: 1, maxLength: 4 })
    .filter((s) => s.trim().length > 0),
  mascotAlt: nonBlankStringArb,
  accentColor: fc.stringMatching(/^#[0-9a-f]{6}$/),
  href: fc.stringMatching(/^\/[a-z0-9-]*$/),
  status: fc.oneof(fc.constant("active" as const), fc.constant("coming_soon" as const)),
});

// ── Property 2 ─────────────────────────────────────────────────────────────────

describe("Property 2: Module Card menampilkan data modul dengan benar", () => {
  /**
   * **Validates: Requirements 1.3, 6.2**
   *
   * For any valid ModuleConfig, rendering ModuleCard must produce output
   * containing the values name, description, emoji, and an indicator of
   * the module's status.
   */
  it(
    "For any valid ModuleConfig, rendered output contains name, description, emoji, and status indicator",
    () => {
      fc.assert(
        fc.property(moduleConfigArb, (module) => {
          const { container, unmount } = render(<ModuleCard module={module} />);
          const scope = within(container);

          // name is rendered in an <h2> heading
          const heading = scope.getByRole("heading", { level: 2 });
          expect(normalise(heading.textContent ?? "")).toBe(normalise(module.name));

          // description is rendered in a <p> element
          const paragraphs = Array.from(container.querySelectorAll("p"));
          const descEl = paragraphs.find(
            (p) => normalise(p.textContent ?? "") === normalise(module.description)
          );
          expect(descEl).toBeDefined();
          expect(descEl).toBeInTheDocument();

          // emoji is rendered in an aria-hidden div
          const emojiDiv = container.querySelector("[aria-hidden='true']");
          expect(emojiDiv).toBeInTheDocument();
          expect(normalise(emojiDiv?.textContent ?? "")).toBe(normalise(module.mascotEmoji));

          // status indicator
          if (module.status === "coming_soon") {
            expect(scope.getByText("Belum Tersedia")).toBeInTheDocument();
          } else {
            expect(scope.queryByText("Belum Tersedia")).not.toBeInTheDocument();
          }

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ── Property 3 ─────────────────────────────────────────────────────────────────

const activeModuleArb: fc.Arbitrary<ModuleConfig> = moduleConfigArb.filter(
  (m) => m.status === "active"
);

describe("Property 3: Active module card menghasilkan URL navigasi yang benar", () => {
  /**
   * **Validates: Requirements 1.4, 2.1**
   *
   * For any ModuleConfig with status: 'active', the navigation URL produced
   * by ModuleCard must equal `/admin/${module.slug}`.
   */
  it(
    "For any active ModuleConfig, rendered card contains a link with href /admin/${module.slug}",
    () => {
      fc.assert(
        fc.property(activeModuleArb, (module) => {
          const { container, unmount } = render(<ModuleCard module={module} />);

          const link = container.querySelector("a");
          expect(link).toBeInTheDocument();
          expect(link).toHaveAttribute("href", `/admin/${module.slug}`);

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ── Property 4 ─────────────────────────────────────────────────────────────────

const inactiveModuleArb: fc.Arbitrary<ModuleConfig> = moduleConfigArb.filter(
  (m) => m.status === "coming_soon"
);

describe("Property 4: Inactive module card selalu disabled dan berlabel \"Belum Tersedia\"", () => {
  /**
   * **Validates: Requirements 1.5, 7.4**
   *
   * For any ModuleConfig with status: 'coming_soon', ModuleCard must render
   * a non-interactive element (no <a> tag, pointer-events: none, aria-disabled)
   * and display the label "Belum Tersedia".
   */
  it(
    "For any inactive ModuleConfig, rendered card is disabled and shows \"Belum Tersedia\"",
    () => {
      fc.assert(
        fc.property(inactiveModuleArb, (module) => {
          const { container, unmount } = render(<ModuleCard module={module} />);

          // No clickable <a> element — card must not be a link
          const link = container.querySelector("a");
          expect(link).not.toBeInTheDocument();

          // Root element has pointer-events: none
          const card = container.firstElementChild as HTMLElement;
          expect(card).toBeInTheDocument();
          expect(card.style.pointerEvents).toBe("none");

          // aria-disabled is set to "true"
          expect(card).toHaveAttribute("aria-disabled", "true");

          // "Belum Tersedia" label is visible
          const label = container.querySelector("span");
          const belumTersedia = Array.from(container.querySelectorAll("span")).find(
            (el) => normalise(el.textContent ?? "") === "Belum Tersedia"
          );
          expect(belumTersedia).toBeInTheDocument();

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});
