import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Seberapa Bucin Kamu?",
    template: "%s | Seberapa Bucin Kamu?",
  },
  description:
    "Uji tingkat kebucinan kamu dengan kuis Purity Test ini! Dari yang cuek bebek sampai budak cinta sejati, kamu ada di level mana?",
  keywords: ["bucin", "kuis bucin", "purity test", "cinta", "tes kebucinan"],
  openGraph: {
    title: "Seberapa Bucin Kamu?",
    description:
      "Uji tingkat kebucinan kamu dengan kuis interaktif yang seru dan jujur!",
    type: "website",
    url: "https://seberapakamu.id/bucin",
    images: [
      {
        url: "/og/bucin.png", // Make sure to create this later if possible
        width: 1200,
        height: 630,
        alt: "Seberapa Bucin Kamu?",
      },
    ],
  },
  alternates: {
    canonical: "https://seberapakamu.id/bucin",
  },
};

export default function BucinLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="bucin-theme-wrapper min-h-screen"
      style={
        {
          "--color-primary": "#FF4B72",
          "--color-primary-dark": "#D81B60",
          "--color-secondary": "#FFB6C1",
          "--color-accent": "#E91E63",
          "--color-accent-dark": "#C2185B",
          "--color-success": "#4CAF50",
          "--color-warning": "#FFC107",
          "--color-info": "#03A9F4",
          "--color-error": "#F44336",
          "--color-bg": "#FFF0F5",
          "--color-surface": "#FFFFFF",
          "--color-surface-alt": "#FCE4EC",
          "--color-border": "#F8BBD0",
          "--color-text": "#4A148C",
          "--color-text-bold": "#311B92",
          "--color-text-muted": "#7B1FA2",
          "--color-text-inverse": "#FFFFFF",
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
