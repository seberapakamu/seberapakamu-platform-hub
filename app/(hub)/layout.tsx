import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "@/app/globals.css";

const nunito = Nunito({
  variable: "--font-hub",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Seberapa Kamu? — Platform Kuis Kepribadian Seru",
  description:
    "Temukan berbagai kuis kepribadian seru di satu tempat! Seberapa wibu, bucin, atau introvert kamu? Mulai kuis gratis sekarang.",
  keywords: ["kuis kepribadian", "seberapa wibu", "kuis online", "tes kepribadian"],
  openGraph: {
    title: "Seberapa Kamu? 🎮",
    description:
      "Platform kuis kepribadian — pilih kuis favoritmu dan temukan siapa dirimu!",
    type: "website",
    url: "https://seberapakamu.id",
    images: [
      {
        url: "/og/hub.png",
        width: 1200,
        height: 630,
        alt: "Seberapa Kamu? — Platform Kuis Kepribadian",
      },
    ],
  },
  alternates: {
    canonical: "https://seberapakamu.id",
  },
};

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={nunito.variable}
      style={{
        fontFamily: "var(--font-hub), sans-serif",
        background: "var(--hub-bg, #0F0F1A)",
        color: "var(--hub-text, #F0F0FF)",
        minHeight: "100vh",
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <style>{`
        :root {
          --hub-bg: #0F0F1A;
          --hub-bg-card: #1A1A2E;
          --hub-bg-card-hover: #1E1E38;
          --hub-text: #F0F0FF;
          --hub-text-muted: #9090B0;
          --hub-text-bold: #FFFFFF;
          --hub-border: #2A2A45;
          --hub-border-glow: rgba(255, 255, 255, 0.1);

          /* Standard tokens for shared components */
          --color-bg: var(--hub-bg);
          --color-surface: var(--hub-bg);
          --color-surface-alt: var(--hub-bg-card);
          --color-border: var(--hub-border);
          --color-primary: #A0C4FF;
          --color-accent: #FFDA6A;
          --color-text: var(--hub-text);
          --color-text-bold: var(--hub-text-bold);
          --color-text-muted: var(--hub-text-muted);
        }
      `}</style>
      {children}
    </div>
  );
}
