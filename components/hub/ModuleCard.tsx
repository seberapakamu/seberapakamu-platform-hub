import Link from "next/link";
import type { Module } from "@/lib/hub/modules";

interface ModuleCardProps {
  module: Module;
}

function isMascotImage(mascot: string): boolean {
  return mascot.startsWith("/") || mascot.includes(".");
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const cardId = `module-card-${module.id}`;

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem 1.5rem",
    borderRadius: "1rem",
    background: "#1A1A2E",
    border: `2px solid ${module.accentColor}`,
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    outline: "none",
  };

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
        href={module.href}
        style={cardStyle}
        aria-label={`Buka modul ${module.name}`}
        tabIndex={0}
      >
        <div style={{ marginBottom: "1rem" }}>
          {isMascotImage(module.mascotEmoji) ? (
            <img
              src={module.mascotEmoji}
              alt={module.mascotAlt}
              style={{ width: "80px", height: "80px", objectFit: "contain" }}
            />
          ) : (
            <span
              role="img"
              aria-label={module.mascotAlt}
              style={{ fontSize: "4rem", lineHeight: 1 }}
            >
              {module.mascotEmoji}
            </span>
          )}
        </div>

        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#FFFFFF",
          }}
        >
          {module.name}
        </h2>

        <p
          style={{
            margin: "0 0 1rem",
            fontSize: "0.9rem",
            color: "#9090B0",
            lineHeight: 1.5,
          }}
        >
          {module.description}
        </p>

        {module.category && (
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
            {module.category}
          </span>
        )}
      </Link>
    </>
  );
}
