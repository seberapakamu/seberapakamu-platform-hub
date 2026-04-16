import type { Metadata } from "next";

interface Props {
  params: Promise<{ hash: string }>;
  searchParams?: Promise<{ score?: string; username?: string; tier?: string }>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https://seberapakamu")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.URL // Netlify sets this automatically
    ? process.env.URL
    : "https://seberapakahkamu.netlify.app";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = searchParams ? await searchParams : {};
  const score = sp.score ?? "?";
  const username = sp.username ? decodeURIComponent(sp.username) : "Seseorang";

  const tierLabels: Record<string, string> = {
    "1": "Casual Viewer 🌱",
    "2": "Anime Enjoyer 🌸",
    "3": "Wibu Terlatih ⚔️",
    "4": "Wibu Veteran 🏆",
    "5": "Sepuh Wibu 👑",
  };
  const tierLabel = sp.tier ? (tierLabels[sp.tier] ?? "Wibu") : "Wibu";

  const title = `${username} dapat ${score}/100 — ${tierLabel} | Seberapa Wibu Kamu?`;
  const description = `${username} mendapat skor ${score}/100 dan menjadi ${tierLabel}. Coba kuis Seberapa Wibu Kamu dan temukan level kewibuan kamu!`;

  const ogImageUrl = `${BASE_URL}/api/og/result?score=${score}&username=${encodeURIComponent(username)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Hasil kuis ${username}: ${score}/100 — ${tierLabel}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
