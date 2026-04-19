import ModuleCard from "@/components/hub/ModuleCard";
import ComingSoonCard from "@/components/hub/ComingSoonCard";
import { MODULES } from "@/lib/hub/modules";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const activeModules = MODULES.filter((m) => m.status === "active");
  const comingSoonModules = MODULES.filter((m) => m.status === "coming_soon");

  // Fetch latest blogs
  const { data: latestArticles } = await supabase
    .from("articles")
    .select("id, judul, slug, gambar_url, updated_at, module_slug")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(3);

  const navLinks = [
    { href: "/blog", label: "✍️ Blog" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--hub-bg)",
        color: "var(--hub-text)",
      }}
    >
      <style>{`
        .hub-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .hub-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .hub-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .saweria-btn:hover { opacity: 0.85; }
        .blog-card-hub:hover {
          transform: translateY(-4px);
          border-color: var(--hub-text-muted) !important;
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <PublicNavbar
        logoEmoji="🎮"
        logoText="Seberapa Kamu?"
        logoHref="/"
        navLinks={navLinks}
        quizHref="/"
        quizText="Pilih Kuis ✨"
      />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          padding: "3rem 1rem",
          boxSizing: "border-box",
        }}
      >
        {/* Hero Section */}
        <section
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
          aria-labelledby="hub-headline"
        >
          <h1
            id="hub-headline"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 900,
              color: "var(--hub-text-bold)",
              margin: "0 0 1rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Seberapa Kamu? 🎮
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "var(--hub-text-muted)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Platform kuis kepribadian seru — pilih kuis favoritmu dan temukan
            siapa dirimu!
          </p>
        </section>

        {/* Module Grid */}
        <section aria-label="Daftar modul kuis" style={{ marginBottom: "5rem" }}>
          <div className="hub-grid">
            {activeModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
            {comingSoonModules.map((module) => (
              <ComingSoonCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        {/* Blog Section */}
        {latestArticles && latestArticles.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--hub-text-bold)" }}>✍️ Blog Terbaru</h2>
              <Link href="/blog" style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-primary)", textDecoration: "none" }}>
                Lihat Semua →
              </Link>
            </div>
            <div className="hub-grid">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="blog-card-hub"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--hub-bg-card)",
                    border: "1px solid var(--hub-border)",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ height: "160px", background: "var(--hub-border)", position: "relative" }}>
                    {article.gambar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.gambar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <span style={{ position: "absolute", top: "1rem", left: "1rem", fontSize: "0.65rem", background: "rgba(0,0,0,0.5)", padding: "0.25rem 0.5rem", borderRadius: "0.5rem", color: "#fff", backdropFilter: "blur(4px)", fontWeight: 800, textTransform: "uppercase" }}>
                      {article.module_slug || "Umum"}
                    </span>
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--hub-text-bold)", lineHeight: 1.4, marginBottom: "0.5rem" }}>
                      {article.judul}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--hub-text-muted)" }}>
                      {new Date(article.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter
        logoEmoji="🎮"
        logoText="Seberapa Kamu?"
        footerLinks={[
          { href: "/", label: "🏠 Hub" },
          { href: "/blog", label: "✍️ Blog" },
          { href: "/wibu", label: "🎌 Wibu" },
          { href: "/bucin", label: "💖 Bucin" },
        ]}
      />
    </div>
  );
}
