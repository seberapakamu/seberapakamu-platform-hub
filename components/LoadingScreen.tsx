interface LoadingScreenProps {
  /** Emoji atau karakter yang ditampilkan sebagai ikon loading */
  emoji: string;
  /** Warna aksen modul (hex), digunakan untuk teks label */
  accentColor?: string;
  /** Background color, default transparan (inherit dari layout) */
  bgColor?: string;
  /** Label teks di bawah emoji, default "Memuat..." */
  label?: string;
}

/**
 * Shared loading screen untuk semua modul platform.
 *
 * Cara pakai di loading.tsx modul baru:
 *
 * ```tsx
 * import LoadingScreen from "@/components/LoadingScreen";
 * export default function Loading() {
 *   return <LoadingScreen emoji="💘" accentColor="#FF6B9D" bgColor="#fff0f5" />;
 * }
 * ```
 *
 * Data emoji dan accentColor tersedia di lib/shared/registry.ts.
 */
export default function LoadingScreen({
  emoji,
  accentColor = "#888",
  bgColor,
  label = "Memuat...",
}: LoadingScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bgColor,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: "3.5rem", animation: "ls-pulse 1.2s ease-in-out infinite" }}
          aria-hidden="true"
        >
          {emoji}
        </div>
        <p
          style={{
            marginTop: "0.75rem",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: accentColor,
          }}
        >
          {label}
        </p>
      </div>
      <style>{`
        @keyframes ls-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.88); }
        }
      `}</style>
    </div>
  );
}
