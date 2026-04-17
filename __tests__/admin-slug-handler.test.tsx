/**
 * Example-based test: akses slug tidak dikenal mengembalikan 404
 * Task 9.2 — Requirements: 2.4
 *
 * Verifies that notFound() is called when accessing a slug
 * that does not exist in MODULES.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNotFound = jest.fn();
const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

jest.mock("../lib/supabase.server", () => ({
  createServerClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "admin-123", email: "admin@test.com" } },
        }),
      },
    })
  ),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

import AdminSlugPage from "../app/admin/[slug]/page";
import { MODULES } from "../lib/modules.config";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("app/admin/[slug]/page.tsx — slug tidak dikenal (Req 2.4)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Task 9.2: notFound() dipanggil untuk slug yang tidak ada di MODULES
  it("Req 2.4: memanggil notFound() untuk slug yang tidak ada di MODULES", async () => {
    await expect(
      AdminSlugPage({ params: Promise.resolve({ slug: "tidak-ada" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("Req 2.4: memanggil notFound() untuk slug 'unknown-module'", async () => {
    await expect(
      AdminSlugPage({ params: Promise.resolve({ slug: "unknown-module" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("Req 2.4: memanggil notFound() untuk slug acak yang tidak ada di MODULES", async () => {
    const slugTidakAda = "modul-yang-belum-ada-sama-sekali";
    // Pastikan slug ini memang tidak ada di MODULES
    expect(MODULES.find((m) => m.slug === slugTidakAda)).toBeUndefined();

    await expect(
      AdminSlugPage({ params: Promise.resolve({ slug: slugTidakAda }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("Req 2.4: tidak memanggil notFound() untuk slug yang ada di MODULES (coming_soon)", async () => {
    const comingSoonModule = MODULES.find((m) => m.status === "coming_soon");
    if (!comingSoonModule) return;

    await expect(
      AdminSlugPage({ params: Promise.resolve({ slug: comingSoonModule.slug }) })
    ).rejects.toThrow("NEXT_REDIRECT:/admin?info=coming-soon");

    expect(mockNotFound).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/admin?info=coming-soon");
  });
});

// Task 9.3: MODULES array contains wibu with status active
describe("MODULES configuration (Req 1.6, 7.1)", () => {
  it("mengandung modul dengan slug 'wibu' dan status 'active'", () => {
    const wibuModule = MODULES.find((m) => m.slug === "wibu");
    expect(wibuModule).toBeDefined();
    expect(wibuModule?.status).toBe("active");
  });

  it("MODULES array tidak kosong", () => {
    expect(MODULES.length).toBeGreaterThan(0);
  });

  it("setiap modul memiliki field yang diperlukan", () => {
    for (const m of MODULES) {
      expect(m.slug).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.mascotEmoji).toBeTruthy();
      expect(m.accentColor).toBeTruthy();
      expect(["active", "coming_soon"]).toContain(m.status);
    }
  });
});
