import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getTier } from "@/lib/scoring";

interface Props {
  params: Promise<{ hash: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { hash } = await params;
  const sp = searchParams ? await searchParams : {};

  // Try Supabase first, fall back to query params
  const dbResult = await getResultByHash(hash);

  const username = dbResult?.username
    ?? (typeof sp.username === "string" ? decodeURIComponent(sp.username) : null)
    ?? "Seseorang";

  const score = dbResult?.score
    ?? (typeof sp.score === "string" && sp.score !== "?" ? parseFloat(sp.score) : null)
    ?? 0;

  const tierInfo = getTier(Number(score));

  const title = `${username} dapat ${score}/100 — ${tierInfo.title} | Seberapa Wibu Kamu?`;
  const description = `${username} mendapat skor ${score}/100 dan menjadi ${tierInfo.title}. Coba kuis Seberapa Wibu Kamu dan temukan level kewibuan kamu!`;
  const ogImageUrl = `${BASE_URL}/api/og/result?score=${score}&username=${encodeURIComponent(username)}`;
  const pageUrl = `${BASE_URL}/wibu/result/${hash}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
