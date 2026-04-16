import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase.server";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Artikel Wibu & Anime | WibuQuiz",
  description:
    "Baca artikel terbaru seputar dunia anime, manga, dan budaya wibu. Tips, review, dan cerita seru dari komunitas WibuQuiz!",
  openGraph: {
    title: "Blog — Artikel Wibu & Anime | WibuQuiz",
    description:
      "Baca artikel terbaru seputar dunia anime, manga, dan budaya wibu.",
    type: "website",
  },
  alternates: {
    canonical: "https://seberapakamu.id/wibu/blog",
  },
};

interface Article {
  id: number;
  judul: string;
  slug: string;
  gambar_url: string | null;
  updated_at: string;
}

function formatIndonesianDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function getPublishedArticles(): Promise<Article[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, judul, slug, gambar_url, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-12 sm:py-16 px-4 text-center">
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">✍️</div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              Blog WibuQuiz
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Artikel seru seputar anime, manga, dan budaya wibu — ditulis dengan cinta dari komunitas kami! 🎌
            </p>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            {articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4" aria-hidden="true">📭</div>
                <h2 className="text-xl font-black mb-2" style={{ color: "var(--color-text-bold)" }}>
                  Belum ada artikel
                </h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Artikel akan segera hadir. Stay tuned! ✨
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="rounded-2xl shadow-sm overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
                    style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    {article.gambar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.gambar_url}
                        alt={article.judul}
                        className="w-full object-cover rounded-t-2xl"
                        style={{ height: "180px" }}
                        loading="lazy"
                      />
                    )}
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <h2 className="font-black text-lg leading-snug" style={{ color: "var(--color-text-bold)" }}>
                        {article.judul}
                      </h2>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {formatIndonesianDate(article.updated_at)}
                      </p>
                      <div className="mt-auto pt-3">
                        <Link
                          href={`/wibu/blog/${article.slug}`}
                          className="text-sm font-bold transition-opacity hover:opacity-80"
                          style={{ color: "var(--color-accent)" }}
                        >
                          Baca Selengkapnya →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
