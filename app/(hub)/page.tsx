import ModuleCard from "@/components/hub/ModuleCard";
import ComingSoonCard from "@/components/hub/ComingSoonCard";
import { MODULES } from "@/lib/hub/modules";

export const dynamic = "force-static";

export default function HubPage() {
  const activeModules = MODULES.filter((m) => m.status === "active");
  const comingSoonModules = MODULES.filter((m) => m.status === "coming_soon");

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
          .hub-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .hub-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .saweria-btn:hover { opacity: 0.85; }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* Navbar */}
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
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: 900,
            color: "var(--hub-text-bold)",
            letterSpacing: "-0.02em",
          }}
        >
          🎮 Seberapa Kamu?
        </span>

        {/* Breadcrumb / location indicator */}
        <span
          aria-label="Kamu sedang di: Hub"
          style={{
            fontSize: "0.75rem",
            color: "var(--hub-text-muted)",
            background: "var(--hub-bg-card)",
            border: "1px solid var(--hub-border)",
            borderRadius: "999px",
            padding: "0.25rem 0.75rem",
          }}
        >
          🏠 Hub
        </span>
      </header>

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
        <section aria-label="Daftar modul kuis">
          <div className="hub-grid">
            {activeModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
            {comingSoonModules.map((module) => (
              <ComingSoonCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1.5rem 2rem",
          borderTop: "1px solid var(--hub-border)",
          textAlign: "center",
          color: "var(--hub-text-muted)",
          fontSize: "0.8rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <a
          className="saweria-btn"
          href="https://saweria.co/seberapakamu"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "999px",
            background: "#FFDA6A",
            color: "#7A4F00",
            fontWeight: 800,
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          ☕ Seberapa dermawan kamu?
        </a>
        <span>© {new Date().getFullYear()} Seberapa Kamu? — All rights reserved.</span>
      </footer>
    </div>
  );
}
