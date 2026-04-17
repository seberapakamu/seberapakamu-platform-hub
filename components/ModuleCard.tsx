import Link from "next/link";
import type { UnifiedModule } from "@/lib/shared";

interface ModuleCardProps {
  module: UnifiedModule;
  reviewCount?: number;
}

export default function ModuleCard({ module, reviewCount = 0 }: ModuleCardProps) {
  const isActive = module.status === "active";
  const cardId = `admin-module-card-${module.slug}`;

  const cardContent = (
    <>
      {/* Review count badge */}
      {reviewCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            minWidth: "1.5rem",
            height: "1.5rem",
            padding: "0 0.375rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 900,
            color: "#FFFFFF",
            background: module.accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={`${reviewCount} item perlu ditinjau`}
        >
          {reviewCount}
        </span>
      )}

      {/* Emoji */}
      <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "1rem" }} aria-hidden="true">
      {module.mascotEmoji}
      </div>

      {/* Name */}
      <h2
        style={{
          margin: "0 0 0.5rem",
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.3,
        }}
      >
        {module.name}
      </h2>

      {/* Description */}
      <p
        style={{
          margin: "0 0 1rem",
          fontSize: "0.875rem",
          color: "#9090B0",
          lineHeight: 1.5,
        }}
      >
        {module.description}
      </p>

      {/* Status badge */}
      {isActive ? (
        <span
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: `${module.accentColor}22`,
            color: module.accentColor,
            border: `1px solid ${module.accentColor}55`,
          }}
        >
          Aktif
        </span>
      ) : (
        <span
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.07)",
            color: "#9090B0",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Belum Tersedia
        </span>
      )}
    </>
  );

  const baseCardStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem 1.5rem",
    borderRadius: "1rem",
    background: "#1A1A2E",
    textDecoration: "none",
    color: "inherit",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    outline: "none",
  };

  if (isActive) {
    return (
      <>
        <style>{`
          #${cardId}:hover,
          #${cardId}:focus {
            box-shadow: 0 0 20px ${module.accentColor}66, 0 0 40px ${module.accentColor}33;
            transform: translateY(-4px);
          }
          #${cardId}:focus-visible {
            outline: 3px solid ${module.accentColor};
            outline-offset: 3px;
          }
        `}</style>
        <Link
          id={cardId}
          href={`/admin/${module.slug}`}
          style={{
            ...baseCardStyle,
            border: `2px solid ${module.accentColor}`,
            cursor: "pointer",
          }}
          aria-label={`Buka panel modul ${module.name}`}
        >
          {cardContent}
        </Link>
      </>
    );
  }

  return (
    <div
      style={{
        ...baseCardStyle,
        border: `2px dashed ${module.accentColor}`,
        opacity: 0.45,
        pointerEvents: "none",
        cursor: "default",
      }}
      aria-disabled="true"
    >
      {cardContent}
    </div>
  );
}
