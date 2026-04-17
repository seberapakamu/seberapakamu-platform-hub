/**
 * __tests__/hub/redirects.test.ts
 *
 * Tests konfigurasi redirect di next.config.ts
 *
 * Feature: seberapakamu-platform-hub
 * Property 7: Konfigurasi redirect mencakup semua pasangan URL lama → URL baru
 * Validates: Requirements 3.2, 7.1, 7.2, 7.3, 7.5
 */

import fc from "fast-check";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require("../../next.config").default ?? require("../../next.config");

// ─── Expected Redirects ───────────────────────────────────────────────────────

interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

/**
 * 7 pasangan redirect yang harus ada sesuai spesifikasi.
 * Validates: Requirements 3.2, 7.1, 7.2
 */
const EXPECTED_REDIRECTS: Omit<RedirectRule, "permanent">[] = [
  { source: "/username", destination: "/wibu/username" },
  { source: "/quiz", destination: "/wibu/quiz" },
  { source: "/result/:hash", destination: "/wibu/result/:hash" },
  { source: "/wiki", destination: "/wibu/wiki" },
  { source: "/tentang-wibu", destination: "/wibu/tentang-wibu" },
  { source: "/blog", destination: "/wibu/blog" },
  { source: "/blog/:slug", destination: "/wibu/blog/:slug" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getRedirects(): Promise<RedirectRule[]> {
  if (typeof nextConfig.redirects !== "function") {
    return [];
  }
  return (await nextConfig.redirects()) as RedirectRule[];
}

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("Redirect config — unit tests", () => {
  let allRedirects: RedirectRule[];
  // Hub-specific redirects only (exclude /admin/* redirects added by other specs)
  let redirects: RedirectRule[];

  beforeAll(async () => {
    allRedirects = await getRedirects();
    redirects = allRedirects.filter(
      (r) => !r.source.startsWith("/admin") && !r.destination.startsWith("/admin")
    );
  });

  it("konfigurasi redirects dapat dipanggil dan mengembalikan array", () => {
    expect(Array.isArray(allRedirects)).toBe(true);
  });

  it("mengandung tepat 7 hub redirect rules", () => {
    expect(redirects).toHaveLength(7);
  });

  it.each(EXPECTED_REDIRECTS)(
    "redirect $source → $destination ada dengan permanent: true",
    ({ source, destination }) => {
      const found = redirects.find(
        (r) => r.source === source && r.destination === destination
      );
      expect(found).toBeDefined();
      expect(found!.permanent).toBe(true);
    }
  );

  it("semua hub redirect memiliki permanent: true (HTTP 301)", () => {
    redirects.forEach((r) => {
      expect(r.permanent).toBe(true);
    });
  });

  it("semua hub destination menggunakan prefix /wibu/", () => {
    redirects.forEach((r) => {
      expect(r.destination).toMatch(/^\/wibu\//);
    });
  });

  it("semua hub source tidak menggunakan prefix /wibu/ (URL lama)", () => {
    redirects.forEach((r) => {
      expect(r.source).not.toMatch(/^\/wibu/);
    });
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe("Redirect config — property-based tests", () => {
  let allRedirects: RedirectRule[];
  // Hub-specific redirects only (exclude /admin/* redirects added by other specs)
  let redirects: RedirectRule[];

  beforeAll(async () => {
    allRedirects = await getRedirects();
    redirects = allRedirects.filter(
      (r) => !r.source.startsWith("/admin") && !r.destination.startsWith("/admin")
    );
  });

  /**
   * Property 7: Konfigurasi redirect mencakup semua pasangan URL lama → URL baru
   * Validates: Requirements 3.2, 7.1, 7.2
   *
   * Untuk setiap pasangan redirect yang didefinisikan dalam spesifikasi,
   * konfigurasi harus mengandung entri dengan source, destination, dan permanent: true.
   */
  it("Property 7: setiap pasangan redirect yang diharapkan ada dalam konfigurasi", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...EXPECTED_REDIRECTS),
        ({ source, destination }) => {
          const found = redirects.find(
            (r) => r.source === source && r.destination === destination
          );
          return found !== undefined && found.permanent === true;
        }
      ),
      { numRuns: EXPECTED_REDIRECTS.length }
    );
  });

  /**
   * Property 7 (hub only): semua hub redirect menggunakan prefix /wibu/ sebagai destination
   * Validates: Requirements 7.5
   */
  it("Property 7 (hub only): semua hub redirect destination menggunakan prefix /wibu/", () => {
    fc.assert(
      fc.property(fc.constantFrom(...redirects), (redirect) => {
        return redirect.destination.startsWith("/wibu/");
      }),
      { numRuns: redirects.length }
    );
  });
});
