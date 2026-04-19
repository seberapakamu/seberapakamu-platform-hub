import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.207.116.97", "10.215.219.97"],
  async redirects() {
    return [
      // Redirect URL lama modul wibu → prefix /wibu/
      // Catatan: route /admin/* tidak disentuh sama sekali
      {
        source: "/username",
        destination: "/wibu/username",
        permanent: true,
      },
      {
        source: "/quiz",
        destination: "/wibu/quiz",
        permanent: true,
      },
      {
        source: "/result/:hash",
        destination: "/wibu/result/:hash",
        permanent: true,
      },
      {
        source: "/wiki",
        destination: "/wibu/wiki",
        permanent: true,
      },
      {
        source: "/tentang-wibu",
        destination: "/wibu/tentang-wibu",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/wibu/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/wibu/blog/:slug",
        permanent: true,
      },
      // Redirect URL admin lama → prefix /admin/wibu/
      {
        source: "/admin/dashboard",
        destination: "/admin/wibu",
        permanent: true,
      },
      {
        source: "/admin/questions",
        destination: "/admin/wibu/questions",
        permanent: true,
      },
      {
        source: "/admin/content",
        destination: "/admin/wibu/content",
        permanent: true,
      },
      {
        source: "/admin/site-content",
        destination: "/admin/wibu/site-content",
        permanent: true,
      },
    ];
  },
  images: {
    // Use modern formats for better compression and faster LCP
    formats: ["image/avif", "image/webp"],
    // Minimize layout shift with explicit device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Longer cache TTL for static assets
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
    ],
  },
  // Compress responses for faster page loads
  compress: true,
  // Enable React strict mode for better performance profiling
  reactStrictMode: true,
  // Experimental: optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ["next/font"],
  },
};

export default nextConfig;
