import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata: Metadata = {
  title: "Blog — Seberapa Kamu?",
  description: "Baca artikel seru seputar kuis kepribadian, budaya pop, dan lainnya.",
};

interface Article {
  id: number;
  judul: string;
  slug: string;
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

export default async function HubBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const sp = await searchParams;
  const currentModule = sp?.module || "semua";

  let query = supabase
    .from("articles")
    .select("id, judul, slug, gambar_url, updated_at, module_slug")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (currentModule !== "semua") {
    query = query.eq("module_slug", currentModule);
  }

  const { data } = await query;
  const articles: Article[] = data ?? [];

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
        .blog-card:hover {
          transform: translateY(-4px);
          border-color: var(--hub-text-muted) !important;
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
          ✍️ Blog
        </span>
      </header>

      <main style={{ flex: 1, maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "3rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              color: "var(--hub-text-bold)",
              marginBottom: "1rem",
            }}
          >
            Blog & Artikel
          </h1>
          <p style={{ color: "var(--hub-text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Jelajahi berbagai artikel seru, tips, dan wawasan dari semua modul kuis kami.
          </p>
        </div>

        {/* Filter Categories */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          {[
            { id: "semua", label: "Semua Kategori", emoji: "🌐" },
            { id: "wibu", label: "Wibu", emoji: "🌸" },
            { id: "bucin", label: "Bucin", emoji: "💖" },
          ].map((cat) => {
            const isActive = currentModule === cat.id;
            return (
              <Link
                key={cat.id}
                href={cat.id === "semua" ? "/blog" : `/blog?module=${cat.id}`}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "999px",
                  background: isActive ? "#F0F0FF" : "transparent",
                  color: isActive ? "#0F0F1A" : "var(--hub-text-muted)",
                  border: `1px solid ${isActive ? "#F0F0FF" : "var(--hub-border)"}`,
                  textDecoration: "none",
                  fontWeight: isActive ? 800 : 600,
                  transition: "all 0.2s",
                }}
              >
                {cat.emoji} {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--hub-text-bold)" }}>Belum ada artikel</h2>
            <p style={{ color: "var(--hub-text-muted)" }}>Pilih kategori lain atau nantikan artikel terbaru kami.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="blog-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--hub-bg-card)",
                  border: "1px solid var(--hub-border)",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
              >
                {article.gambar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.gambar_url}
                    alt={article.judul}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: "100%", height: "180px", background: "var(--hub-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hub-text-muted)" }}>
                    Tidak ada gambar
                  </div>
                )}
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", background: "var(--hub-border)", padding: "0.2rem 0.6rem", borderRadius: "0.5rem", color: "var(--hub-text-muted)", textTransform: "uppercase", fontWeight: 800 }}>
                      {article.module_slug || "Umum"}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--hub-text-bold)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                    {article.judul}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--hub-text-muted)", marginTop: "auto" }}>
                    {formatIndonesianDate(article.updated_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer style={{ padding: "1.5rem", borderTop: "1px solid var(--hub-border)", textAlign: "center", color: "var(--hub-text-muted)", fontSize: "0.85rem" }}>
        © {new Date().getFullYear()} Seberapa Kamu?
      </footer>
    </div>
  );
}
