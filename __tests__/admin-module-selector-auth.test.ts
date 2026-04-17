/**
 * Example-based test: Auth guard for Module Selector page
 * Requirements: 1.7, 4.1
 *
 * Verifies that app/admin/page.tsx calls redirect('/admin/login')
 * when getUser() returns null (unauthenticated user).
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    // next/navigation redirect throws an error in Next.js to stop rendering;
    // simulate that so the page function stops execution after redirect.
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

const mockGetUser = jest.fn();

jest.mock("../lib/supabase.server", () => ({
  createServerClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    })
  ),
}));

// Minimal mocks to prevent import errors for components not under test
jest.mock("../components/AdminLogoutButton", () => {
  const MockBtn = () => null;
  MockBtn.displayName = "AdminLogoutButton";
  return MockBtn;
});

jest.mock("../components/ModuleCard", () => {
  const MockCard = () => null;
  MockCard.displayName = "ModuleCard";
  return MockCard;
});

jest.mock("../lib/modules.config", () => ({
  MODULES: [],
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

import AdminModuleSelectorPage from "../app/admin/page";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Auth guard — Module Selector Page (Req 1.7, 4.1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Req 1.7 / 4.1: calls redirect('/admin/login') when getUser() returns null", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(AdminModuleSelectorPage()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it("Req 1.7 / 4.1: does NOT call redirect when getUser() returns a valid user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "admin@test.com" } },
    });

    // Should resolve without throwing
    await expect(AdminModuleSelectorPage()).resolves.toBeDefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("Req 4.1: redirect target is exactly '/admin/login' (not '/admin' or '/login')", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    try {
      await AdminModuleSelectorPage();
    } catch {
      // expected
    }

    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    expect(mockRedirect).not.toHaveBeenCalledWith("/admin");
    expect(mockRedirect).not.toHaveBeenCalledWith("/login");
  });
});
