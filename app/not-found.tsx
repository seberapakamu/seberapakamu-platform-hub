import Link from "next/link";

export const metadata = {
  title: "404 — Kamu Tersesat di Isekai 🌀",
  description: "Halaman tidak ditemukan. Kamu mungkin tersesat di dunia lain!",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F0F1A",
        color: "#F0F0FF",
        fontFamily: "system-ui, sans-serif",
        padding: "1rem",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "fixed",
          top: "-5rem",
          left: "-5rem",
          width: "18rem",
          height: "18rem",
          borderRadius: "50%",
          opacity: 0.15,
          filter: "blur(3rem)",
          backgroundColor: "#FF9A9E",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          bottom: "-5rem",
          right: "-5rem",
          width: "18rem",
          height: "18rem",
          borderRadius: "50%",
          opacity: 0.15,
          filter: "blur(3rem)",
          backgroundColor: "#7C3AED",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: "relative",
          maxWidth: "32rem",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Card */}
        <div
          style={{
            backgroundColor: "#1A1A2E",
            border: "1px solid #2A2A45",
            borderRadius: "1.5rem",
            padding: "3rem 2rem",
          }}
        >
          {/* Big 404 */}
          <div
            style={{
              fontSize: "6rem",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: "0.5rem",
              color: "#FF9A9E",
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            404
          </div>

          {/* Decorative emoji row */}
          <div style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }} aria-hidden="true">
            🌀✨🗺️✨🌀
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "0.75rem",
              color: "#FFFFFF",
            }}
          >
            Kamu Tersesat di Isekai!
          </h1>

          {/* Message */}
          <p style={{ color: "#F0F0FF", marginBottom: "0.5rem", lineHeight: 1.7 }}>
            Sepertinya kamu baru saja di-truck-kun dan mendarat di dimensi yang
            salah. Halaman ini tidak ada di dunia ini — maupun di dunia sebelah.
            😅
          </p>
          <p style={{ color: "#9090B0", fontSize: "0.875rem", marginBottom: "2rem" }}>
            Tenang, kamu belum jadi protagonist isekai. Balik ke halaman awal
            sebelum skill cheat-mu aktif!
          </p>

          {/* Primary CTA — back to hub */}
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              borderRadius: "9999px",
              fontSize: "1.125rem",
              fontWeight: 900,
              color: "#FFFFFF",
              backgroundColor: "#FF9A9E",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            aria-label="Kembali ke halaman utama"
          >
            🏠 Balik ke Dunia Nyata
          </Link>

          {/* Secondary link — start quiz */}
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/wibu/username"
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                color: "#7C3AED",
              }}
            >
              Atau mulai kuis dulu? 🎌
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#9090B0" }}>
          Error 404 · Halaman tidak ditemukan
        </p>
      </div>
    </div>
  );
}
