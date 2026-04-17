import type { Module } from "@/lib/hub/modules";
import { isMascotImage } from "@/lib/shared";

interface ComingSoonCardProps {
  module: Module;
}

export default function ComingSoonCard({ module }: ComingSoonCardProps) {
  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem 1.5rem",
    borderRadius: "1rem",
    background: "#1A1A2E",
    border: `2px dashed ${module.accentColor}`,
    opacity: 0.5,
    pointerEvents: "none",
    cursor: "default",
  };

  const mascotStyle: React.CSSProperties = {
    marginBottom: "1rem",
    filter: "grayscale(100%)",
  };

  return (
    <div style={cardStyle} aria-disabled="true">
      <div style={mascotStyle}>
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

      <span
        style={{
          display: "inline-block",
          padding: "0.25rem 0.75rem",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          background: "rgba(255,255,255,0.1)",
          color: "#F0F0FF",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Segera Hadir
      </span>
    </div>
  );
}
