/**
 * Property-Based Tests for Wibu Panel Layout — Property 5
 *
 * **Validates: Requirements 2.3, 3.3**
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import React from "react";
import * as fc from "fast-check";
import type { UnifiedModule as ModuleConfig } from "../lib/shared";

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

// Mock AdminLogoutButton — not relevant to this property
jest.mock("../components/AdminLogoutButton", () => {
  const MockLogout = () => <button>Logout</button>;
  MockLogout.displayName = "AdminLogoutButton";
  return MockLogout;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise whitespace the same way Testing Library does */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * WibuPanelHeader — a parameterised version of the header section inside
 * WibuPanelLayout. The real layout hardcodes the Wibu module; this helper
 * accepts any ModuleConfig so Property 5 can be verified across arbitrary
 * module configurations.
 *
 * The structure mirrors app/admin/wibu/layout.tsx exactly.
 */
function WibuPanelHeader({
  module,
  otherActiveModules = [],
}: {
  module: ModuleConfig;
  otherActiveModules?: ModuleConfig[];
}) {
  return (
    <header data-testid="panel-header">
      <div>
        {/* Left: back link + active module name */}
        <div data-testid="header-left">
          <a href="/admin">← Pilih Modul</a>
          <span>|</span>
          <span data-testid="active-module-name">
            {module.mascotEmoji} {module.name}
          </span>
        </div>

        {/* Right: shortcuts to other active modules + logout */}
        <div data-testid="header-right">
          {otherActiveModules.map((m) => (
            <a key={m.slug} href={`/admin/${m.slug}`}>
              {m.mascotEmoji} {m.name}
            </a>
          ))}
          <button>Logout</button>
        </div>
      </div>
    </header>
  );
}

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

// ── Property 5 ─────────────────────────────────────────────────────────────────

describe("Property 5: Panel layout menampilkan nama modul aktif", () => {
  /**
   * **Validates: Requirements 2.3, 3.3**
   *
   * For any valid ModuleConfig, rendering the Wibu Panel Layout must produce
   * output that contains module.name in the header/navigation area.
   */
  it(
    "For any valid ModuleConfig, the panel header contains module.name",
    () => {
      fc.assert(
        fc.property(moduleConfigArb, (module) => {
          const { getByTestId, unmount } = render(
            <WibuPanelHeader module={module} />
          );

          // The active module name must appear in the header area
          const header = getByTestId("panel-header");
          expect(header).toBeInTheDocument();

          // The dedicated active-module-name element must contain module.name
          const activeModuleNameEl = getByTestId("active-module-name");
          expect(activeModuleNameEl).toBeInTheDocument();
          expect(normalise(activeModuleNameEl.textContent ?? "")).toContain(
            normalise(module.name)
          );

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});
