/**
 * Example-based test: verifikasi konfigurasi redirect backward compatibility
 * Requirements: 5.2
 */

import nextConfig from "../next.config";

describe("next.config.ts redirect backward compatibility", () => {
  let redirects: Array<{ source: string; destination: string; permanent: boolean }>;

  beforeAll(async () => {
    redirects = await nextConfig.redirects!();
  });

  const expectedRedirects = [
    { source: "/admin/dashboard", destination: "/admin/wibu" },
    { source: "/admin/questions", destination: "/admin/wibu/questions" },
    { source: "/admin/content", destination: "/admin/wibu/content" },
    { source: "/admin/site-content", destination: "/admin/wibu/site-content" },
  ];

  test.each(expectedRedirects)(
    "redirects $source → $destination (permanent)",
    ({ source, destination }) => {
      const match = redirects.find((r) => r.source === source);
      expect(match).toBeDefined();
      expect(match!.destination).toBe(destination);
      expect(match!.permanent).toBe(true);
    }
  );
});
