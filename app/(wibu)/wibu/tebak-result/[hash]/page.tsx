import type { Metadata } from "next";
import ResultPageClient from "./ResultPageClient";

interface Props {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;

  const title = "Hasil Tebak Karakter Anime | seberapakamu.id";
  const description = "Lihat hasil kuis Tebak Karakter Anime di seberapakamu.id!";
  const ogImageUrl = `/api/og/tebak-result?hash=${hash}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function TebakResultPage({ params }: Props) {
  const { hash } = await params;
  return <ResultPageClient hash={hash} />;
}
