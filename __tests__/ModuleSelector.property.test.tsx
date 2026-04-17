/**
 * Property-Based Tests for Module Selector — Property 1
 *
 * **Validates: Requirements 1.2, 7.2**
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
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

// ── Arbitraries ────────────────────────────────────────────────────────────────

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
  status: fc.oneof(
    fc.constant("active" as const),
    fc.constant("coming_soon" as const)
  ),
});

// Unique slugs to avoid duplicate React keys
const moduleListArb: fc.Arbitrary<ModuleConfig[]> = fc
  .array(moduleConfigArb, { minLength: 1, maxLength: 10 })
  .filter(
    (modules) =>
      new Set(modules.map((m) => m.slug)).size === modules.length
  );

// ── Helper: Module Selector grid ───────────────────────────────────────────────

/**
 * Renders the same grid the Module Selector page renders:
 *   modules.map(module => <ModuleCard key={module.slug} module={module} />)
 *
 * This isolates the rendering logic from the server-side auth guard so it
 * can be exercised in jsdom without a Supabase connection.
 */
function ModuleSelectorGrid({ modules }: { modules: ModuleConfig[] }) {
  return (
    <div data-testid="module-grid">
      {modules.map((module) => (
        <ModuleCard key={module.slug} module={module} />
      ))}
    </div>
  );
}

// ── Property 1 ─────────────────────────────────────────────────────────────────

describe("Property 1: Module Selector merender semua modul yang dikonfigurasi", () => {
  /**
   * **Validates: Requirements 1.2, 7.2**
   *
   * For any valid ModuleConfig[], the Module Selector grid must render
   * exactly as many ModuleCard elements as there are modules in the array,
   * without any change to the component code.
   */
  it(
    "For any valid ModuleConfig[], the grid renders exactly one ModuleCard per module",
    () => {
      fc.assert(
        fc.property(moduleListArb, (modules) => {
          const { container, unmount } = render(
            <ModuleSelectorGrid modules={modules} />
          );

          // Each ModuleCard renders either an <a> (active) or a <div> (coming_soon)
          // as its root element inside the grid wrapper. Active cards also emit a
          // <style> sibling — filter those out when counting.
          const grid = container.querySelector("[data-testid='module-grid']")!;
          const cards = Array.from(grid.children).filter(
            (el) => el.tagName !== "STYLE"
          );

          expect(cards).toHaveLength(modules.length);

          // Each card must correspond to its module: verify the module name
          // appears inside the card at the same index.
          modules.forEach((module, i) => {
            const card = cards[i];
            const heading = card.querySelector("h2");
            expect(heading).toBeInTheDocument();
            expect(heading?.textContent?.trim()).toBe(module.name.trim());
          });

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});
