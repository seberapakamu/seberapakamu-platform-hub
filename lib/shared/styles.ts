import type React from 'react';

/** Style dasar yang digunakan oleh semua varian card */
export const baseCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '1.5rem',
  borderRadius: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  transition: 'all 0.2s ease',
};

/** Style untuk card aktif — membutuhkan accentColor sebagai parameter */
export function getActiveCardStyle(accentColor: string): React.CSSProperties {
  return {
    ...baseCardStyle,
    border: `2px solid ${accentColor}`,
    cursor: 'pointer',
  };
}

/** Style untuk card non-aktif (coming soon) — membutuhkan accentColor sebagai parameter */
export function getInactiveCardStyle(accentColor: string): React.CSSProperties {
  return {
    ...baseCardStyle,
    border: `2px dashed ${accentColor}`,
    opacity: 0.5,
    pointerEvents: 'none',
  };
}
