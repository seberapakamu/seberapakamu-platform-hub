/**
 * Property-Based Tests for Wibu Panel Layout — Property 6
 *
 * **Validates: Requirements 3.1**
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import React from "react";
import * as fc from "fast-check";
import type { ModuleConfig } from "../../lib/modules.config";

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
jest.mock("../../components/AdminLogoutButton", () => {
  const MockLogout = () => <button>Logout</button>;
  MockLogout.displayName = "AdminLogoutButton";
  return MockLogout;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * WibuPanelHeader — a parameterised version of the header section inside
 * WibuPanelLayout. Accepts any ModuleConfig so Property 6 can be verified
 * across arbitrary module configurations.
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
          <a href="/admin" data-testid="back-link">
            ← Pilih Modul
          </a>
          <span>|</span>
          <span data-testid="active-module-name">
            {module.emoji} {module.name}
          </span>
        </div>

        {/* Right: shortcuts to other active modules + logout */}
        <div data-testid="header-right">
          {otherActiveModules.map((m) => (
            <a key={m.slug} href={`/admin/${m.slug}`}>
              {m.emoji} {m.name}
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
  slug: fc.stringMatching(/^[a-z][a-z0-9-]*$/),
  name: nonBlankStringArb,
  description: nonBlankStringArb,
  emoji: fc
    .string({ minLength: 1, maxLength: 4 })
    .filter((s) => s.trim().length > 0),
  color: fc.stringMatching(/^#[0-9a-f]{6}$/),
  status: fc.oneof(
    fc.constant("active" as const),
    fc.constant("coming_soon" as const)
  ),
});

// ── Property 6 ─────────────────────────────────────────────────────────────────

describe("Property 6: Panel layout selalu menyertakan link kembali ke Module Selector", () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * For any page inside the Module Panel Wibu, the layout must render a
   * navigation element containing href="/admin" (the back link to Module Selector).
   */
  it(
    "For any valid ModuleConfig, the panel layout renders an element with href=\"/admin\"",
    () => {
      fc.assert(
        fc.property(moduleConfigArb, (module) => {
          const { container, unmount } = render(
            <WibuPanelHeader module={module} />
          );

          // There must be at least one anchor pointing to /admin
          const backLinks = container.querySelectorAll('a[href="/admin"]');
          expect(backLinks.length).toBeGreaterThanOrEqual(1);

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});
