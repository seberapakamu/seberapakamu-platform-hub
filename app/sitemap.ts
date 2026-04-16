import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase.server";

const BASE_URL = "https://seberapakamu.id";

async function getBlogSlugs(): Promise<string[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug")
      .eq("status", "published");

    if (error || !data) return [];
    return data.map((article: { slug: string }) => article.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/wibu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/wibu/wiki`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/wibu/tentang-wibu`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/wibu/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const slugs = await getBlogSlugs();
  const blogRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/wibu/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
