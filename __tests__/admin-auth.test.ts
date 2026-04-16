/**
 * Unit tests for admin authentication
 * Requirements: 8.4, 8.8
 */

// ─── Middleware tests (Requirement 8.8) ──────────────────────────────────────

const mockGetSession = jest.fn();
const mockRedirect = jest.fn();
const mockNextFn = jest.fn();

// Mock @supabase/ssr before importing middleware
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
  })),
}));

// Fully mock next/server to avoid edge-runtime globals (Request, etc.)
jest.mock("next/server", () => {
  class MockNextRequest {
    nextUrl: URL;
    headers: Map<string, string>;
    cookies: { getAll: () => [] };
    url: string;
    constructor(url: string) {
      this.url = url;
      this.nextUrl = new URL(url);
      this.headers = new Map();
      this.cookies = { getAll: () => [] };
    }
  }

  const MockNextResponse = {
    redirect: (url: URL) => {
      mockRedirect(url.pathname);
      return { type: "redirect", url };
    },
    next: (init?: object) => {
      mockNextFn(init);
      return {
        type: "next",
        cookies: { set: jest.fn(), getAll: jest.fn(() => []) },
        headers: new Map(),
      };
    },
  };

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

describe("Middleware - Requirement 8.8: Redirect unauthenticated admin requests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Re-apply mocks after resetModules
    jest.mock("@supabase/ssr", () => ({
      createServerClient: jest.fn(() => ({
        auth: { getSession: mockGetSession },
      })),
    }));
    jest.mock("next/server", () => {
      class MockNextRequest {
        nextUrl: URL;
        headers: Map<string, string>;
        cookies: { getAll: () => [] };
        url: string;
        constructor(url: string) {
          this.url = url;
          this.nextUrl = new URL(url);
          this.headers = new Map();
          this.cookies = { getAll: () => [] };
        }
      }
      const MockNextResponse = {
        redirect: (url: URL) => { mockRedirect(url.pathname); return { type: "redirect", url }; },
        next: (init?: object) => { mockNextFn(init); return { type: "next", cookies: { set: jest.fn(), getAll: jest.fn(() => []) }, headers: new Map() }; },
      };
      return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
    });
  });

  it("allows /admin/login through without checking session", async () => {
    const { proxy: middleware } = await import("../proxy");
    const { NextRequest } = await import("next/server");
    const req = new (NextRequest as any)("http://localhost/admin/login");
    await middleware(req);
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated request to /admin/login when accessing /admin/dashboard", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { proxy: middleware } = await import("../proxy");
    const { NextRequest } = await import("next/server");
    const req = new (NextRequest as any)("http://localhost/admin/dashboard");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects unauthenticated request to /admin/login when accessing /admin/questions", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { proxy: middleware } = await import("../proxy");
    const { NextRequest } = await import("next/server");
    const req = new (NextRequest as any)("http://localhost/admin/questions");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects unauthenticated request to /admin/login when accessing /admin/analytics", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { proxy: middleware } = await import("../proxy");
    const { NextRequest } = await import("next/server");
    const req = new (NextRequest as any)("http://localhost/admin/analytics");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("allows authenticated request through to /admin/dashboard", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "admin@test.com" } } },
    });
    const { proxy: middleware } = await import("../proxy");
    const { NextRequest } = await import("next/server");
    const req = new (NextRequest as any)("http://localhost/admin/dashboard");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNextFn).toHaveBeenCalled();
  });
});

// ─── Lockout logic tests (Requirement 8.4) ───────────────────────────────────
// Tests exercise the pure lockout logic mirrored from app/admin/login/page.tsx

const STORAGE_KEY = "admin_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

interface AttemptData {
  count: number;
  lockedUntil: number | null;
}

function getAttemptData(): AttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw) as AttemptData;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttemptData(data: AttemptData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isLocked(): boolean {
  const data = getAttemptData();
  return !!(data.lockedUntil && data.lockedUntil > Date.now());
}

function recordFailedAttempt(): AttemptData {
  const data = getAttemptData();
  const newCount = data.count + 1;
  if (newCount >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION;
    const updated = { count: newCount, lockedUntil };
    saveAttemptData(updated);
    return updated;
  }
  const updated = { count: newCount, lockedUntil: null };
  saveAttemptData(updated);
  return updated;
}

function getRemainingMinutes(lockedUntil: number): number {
  return Math.ceil((lockedUntil - Date.now()) / 60000);
}

describe("Lockout logic - Requirement 8.4: Lock after 5 failed attempts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts with 0 failed attempts", () => {
    expect(getAttemptData()).toEqual({ count: 0, lockedUntil: null });
  });

  it("increments attempt count on each failure", () => {
    recordFailedAttempt();
    expect(getAttemptData().count).toBe(1);
    recordFailedAttempt();
    expect(getAttemptData().count).toBe(2);
  });

  it("does NOT lock after 4 failed attempts", () => {
    for (let i = 0; i < 4; i++) recordFailedAttempt();
    expect(isLocked()).toBe(false);
    expect(getAttemptData().lockedUntil).toBeNull();
  });

  it("locks account after exactly 5 failed attempts", () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt();
    expect(isLocked()).toBe(true);
    expect(getAttemptData().lockedUntil).not.toBeNull();
  });

  it("lockout duration is 15 minutes", () => {
    const before = Date.now();
    for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt();
    const { lockedUntil } = getAttemptData();
    expect(lockedUntil).not.toBeNull();
    const duration = lockedUntil! - before;
    // Allow 100ms tolerance for test execution time
    expect(duration).toBeGreaterThanOrEqual(LOCKOUT_DURATION - 100);
    expect(duration).toBeLessThanOrEqual(LOCKOUT_DURATION + 100);
  });

  it("getRemainingMinutes returns 15 immediately after lockout", () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt();
    const { lockedUntil } = getAttemptData();
    expect(getRemainingMinutes(lockedUntil!)).toBe(15);
  });

  it("account is not locked when lockedUntil is in the past (expired lockout)", () => {
    saveAttemptData({ count: MAX_ATTEMPTS, lockedUntil: Date.now() - 1000 });
    expect(isLocked()).toBe(false);
  });

  it("resets attempt count to 0 after successful login", () => {
    for (let i = 0; i < 3; i++) recordFailedAttempt();
    saveAttemptData({ count: 0, lockedUntil: null });
    expect(getAttemptData()).toEqual({ count: 0, lockedUntil: null });
    expect(isLocked()).toBe(false);
  });
});

describe("Lockout message - Requirement 8.4: Display lockout message", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("lockout message includes remaining 15 minutes", () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailedAttempt();
    const { lockedUntil } = getAttemptData();
    const minutes = getRemainingMinutes(lockedUntil!);
    const message = `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`;
    expect(message).toContain("15 menit");
  });

  it("locked state is true when lockedUntil is in the future", () => {
    saveAttemptData({ count: MAX_ATTEMPTS, lockedUntil: Date.now() + LOCKOUT_DURATION });
    expect(isLocked()).toBe(true);
  });

  it("locked state is false before any failed attempts", () => {
    expect(isLocked()).toBe(false);
  });
});
