import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
  module_slug: string | null;
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
      .select("id, judul, slug, konten, gambar_url, updated_at, module_slug")
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
      return { title: "Artikel Tidak Ditemukan | Seberapa Kamu?" };
    }

    const description = stripHtml(article.konten).slice(0, 160);

    return {
      title: `${article.judul} | Seberapa Kamu? Blog`,
      description,
      openGraph: {
        title: article.judul,
        description,
        type: "article",
        ...(article.gambar_url ? { images: [{ url: article.gambar_url }] } : {}),
      },
      alternates: {
        canonical: `https://seberapakamu.id/blog/${article.slug}`,
      },
    };
  } catch {
    return { title: "Blog | Seberapa Kamu?" };
  }
}

export default async function HubBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--hub-bg)",
        color: "var(--hub-text)",
      }}
    >
      <style>{`
        .back-link:hover {
          color: var(--hub-text-bold) !important;
        }
      `}</style>
      {/* Navbar Hub */}
      <header
        style={{
          padding: "1.25rem 1rem",
          borderBottom: "1px solid var(--hub-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.25rem",
            fontWeight: 900,
            color: "var(--hub-text-bold)",
            letterSpacing: "-0.02em",
            textDecoration: "none",
          }}
        >
          🎮 Seberapa Kamu?
        </Link>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--hub-text-muted)",
            background: "var(--hub-bg-card)",
            border: "1px solid var(--hub-border)",
            borderRadius: "999px",
            padding: "0.25rem 0.75rem",
          }}
        >
          ✍️ Blog Artikel
        </span>
      </header>

      <main style={{ flex: 1, maxWidth: "800px", width: "100%", margin: "0 auto", padding: "3rem 1rem" }}>
        <Link
          href={article.module_slug ? `/blog?module=${article.module_slug}` : "/blog"}
          className="back-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--hub-text-muted)",
            textDecoration: "none",
            marginBottom: "2rem",
            transition: "color 0.2s",
          }}
        >
          ← Kembali ke Blog {article.module_slug ? article.module_slug.toUpperCase() : ""}
        </Link>

        <article>
          <header style={{ marginBottom: "2rem" }}>
            {article.module_slug && (
              <div style={{ marginBottom: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "var(--hub-bg-card)",
                    border: "1px solid var(--hub-border)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "999px",
                    color: "var(--hub-text-bold)",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  Modul: {article.module_slug}
                </span>
              </div>
            )}
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900,
                color: "var(--hub-text-bold)",
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              {article.judul}
            </h1>
            <p style={{ color: "var(--hub-text-muted)", fontSize: "0.9rem" }}>
              Diperbarui: {formatIndonesianDate(article.updated_at)}
            </p>
          </header>

          {article.gambar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.gambar_url}
              alt={article.judul}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "1rem",
                marginBottom: "2.5rem",
                border: "1px solid var(--hub-border)",
              }}
            />
          )}

          <div
            className="article-content"
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "var(--hub-text)",
            }}
            dangerouslySetInnerHTML={{ __html: article.konten }}
          />

          {article.module_slug && (
            <div
              style={{
                marginTop: "4rem",
                padding: "2rem",
                background: "var(--hub-bg-card)",
                borderRadius: "1rem",
                border: "1px solid var(--hub-border)",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--hub-text-bold)", marginBottom: "0.5rem" }}>
                Sudah baca artikelnya?
              </h3>
              <p style={{ color: "var(--hub-text-muted)", marginBottom: "1.5rem" }}>
                Coba ikuti kuis dari modul {article.module_slug} sekarang juga!
              </p>
              <Link
                href={`/${article.module_slug}/username`}
                style={{
                  display: "inline-block",
                  padding: "0.75rem 2rem",
                  background: "#F0F0FF",
                  color: "#0F0F1A",
                  borderRadius: "999px",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Mulai Kuis {article.module_slug.toUpperCase()}
              </Link>
            </div>
          )}
        </article>
      </main>

      <footer style={{ padding: "1.5rem", borderTop: "1px solid var(--hub-border)", textAlign: "center", color: "var(--hub-text-muted)", fontSize: "0.85rem", marginTop: "auto" }}>
        © {new Date().getFullYear()} Seberapa Kamu?
      </footer>
    </div>
  );
}
