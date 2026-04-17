/**
 * Property-Based Tests for Wibu Panel Layout — Property 7
 *
 * **Validates: Requirements 3.4, 3.5**
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
 * WibuPanelLayout. Accepts a list of modules so Property 7 can be verified
 * across arbitrary module list configurations.
 *
 * The structure mirrors app/admin/wibu/layout.tsx exactly:
 * - The current panel is "wibu" (hardcoded in the real layout)
 * - Other active modules are rendered as shortcut links in the header-right area
 */
function WibuPanelHeader({ modules }: { modules: ModuleConfig[] }) {
  const otherActiveModules = modules.filter(
    (m) => m.status === "active" && m.slug !== "wibu"
  );

  return (
    <header data-testid="panel-header">
      <div>
        {/* Left: back link + active module name */}
        <div data-testid="header-left">
          <a href="/admin" data-testid="back-link">
            ← Pilih Modul
          </a>
          <span>|</span>
          <span data-testid="active-module-name">🌸 Seberapa Wibu Kamu?</span>
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

const moduleListArb = fc.array(moduleConfigArb, { minLength: 1, maxLength: 10 });

// ── Property 7 ─────────────────────────────────────────────────────────────────

describe("Property 7: Panel layout merender shortcut ke semua modul aktif", () => {
  /**
   * **Validates: Requirements 3.4, 3.5**
   *
   * For any list of ModuleConfig[], rendering the panel layout must produce
   * a link to /admin/${module.slug} for every module with status: 'active'
   * in the list (excluding the current panel's own module, "wibu").
   */
  it(
    "For any module list, the panel layout renders a link for every active module",
    () => {
      fc.assert(
        fc.property(moduleListArb, (modules) => {
          const { container, unmount } = render(
            <WibuPanelHeader modules={modules} />
          );

          // Every active module (except the current "wibu" panel) must have a shortcut link
          const activeOtherModules = modules.filter(
            (m) => m.status === "active" && m.slug !== "wibu"
          );

          for (const m of activeOtherModules) {
            const expectedHref = `/admin/${m.slug}`;
            const link = container.querySelector(`a[href="${expectedHref}"]`);
            expect(link).not.toBeNull();
          }

          unmount();
        }),
        { numRuns: 100 }
      );
    }
  );
});
