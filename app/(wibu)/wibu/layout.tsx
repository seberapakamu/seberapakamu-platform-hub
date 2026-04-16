import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Seberapa Wibu Kamu?",
    template: "%s | Seberapa Wibu Kamu?",
  },
  description:
    "Uji tingkat kewibuan kamu dengan kuis interaktif yang seru dan jujur! Dari casual watcher sampai sepuh wibu — kamu ada di level mana?",
  keywords: ["wibu", "kuis wibu", "anime", "manga", "otaku", "seberapa wibu"],
  openGraph: {
    title: "Seberapa Wibu Kamu?",
    description:
      "Uji tingkat kewibuan kamu dengan kuis interaktif yang seru dan jujur!",
    type: "website",
    url: "https://seberapakamu.id/wibu",
    images: [
      {
        url: "/og/wibu.png",
        width: 1200,
        height: 630,
        alt: "Seberapa Wibu Kamu?",
      },
    ],
  },
  alternates: {
    canonical: "https://seberapakamu.id/wibu",
  },
};

export default function WibuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${nunito.variable}`}>
      {/* Plausible Analytics */}
      <Script
        defer
        data-domain="seberapakamu.id"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      {children}
    </div>
  );
}
