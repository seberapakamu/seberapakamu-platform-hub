import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  return [];
}

interface ArticleDetail {
  id: number;
  judul: string;
  slug: string;
  konten: string;
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("id, judul, slug, konten, gambar_url, updated_at")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return { title: "Artikel Tidak Ditemukan | WibuQuiz" };
    }

    const description = stripHtml(article.konten).slice(0, 160);

    return {
      title: `${article.judul} | WibuQuiz Blog`,
      description,
      openGraph: {
        title: article.judul,
        description,
        type: "article",
        ...(article.gambar_url ? { images: [{ url: article.gambar_url }] } : {}),
      },
      alternates: {
        canonical: `https://seberapakamu.id/wibu/blog/${article.slug}`,
      },
    };
  } catch {
    return { title: "Blog | WibuQuiz" };
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-10 sm:py-14 px-4 text-center">
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
            <Link
              href="/wibu/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold mb-6 transition-opacity hover:opacity-80"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Kembali ke Blog
            </Link>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3"
              style={{ color: "var(--color-text-bold)" }}
            >
              {article.judul}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Diperbarui: {formatIndonesianDate(article.updated_at)}
            </p>
          </div>
        </section>

        {/* Article Content */}
        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto">
            {article.gambar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.gambar_url}
                alt={article.judul}
                className="w-full object-cover rounded-2xl mb-8"
                style={{ maxHeight: "20rem" }}
              />
            )}

            <div
              className="rounded-2xl p-6 sm:p-8 shadow-sm"
              style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: article.konten }}
                style={{
                  color: "var(--color-text)",
                  lineHeight: "1.8",
                  fontSize: "1rem",
                }}
                className="article-content"
              />
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">🎌</div>
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--color-text-bold)" }}>
                Siap uji level wibu-mu?
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                Setelah baca artikel ini, buktikan seberapa wibu kamu!
              </p>
              <Link
                href="/wibu/username"
                className="inline-block px-8 py-3 rounded-full font-black text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                🚀 Mulai Kuis Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
