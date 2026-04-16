import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getTier } from "@/lib/scoring";

interface Props {
  params: Promise<{ hash: string }>;
}

const BASE_URL = process.env.URL || "https://seberapakahkamu.netlify.app";

async function getResultByHash(hash: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("sessions")
      .select("username, score, tier")
      .eq("hash", hash)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  const result = await getResultByHash(hash);

  const username = result?.username ?? "Seseorang";
  const score = result?.score ?? 0;
  const tierInfo = getTier(score);

  const title = `${username} dapat ${score}/100 — ${tierInfo.title} | Seberapa Wibu Kamu?`;
  const description = `${username} mendapat skor ${score}/100 dan menjadi ${tierInfo.title}. Coba kuis Seberapa Wibu Kamu dan temukan level kewibuan kamu!`;
  const ogImageUrl = `${BASE_URL}/api/og/result?score=${score}&username=${encodeURIComponent(username)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
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
