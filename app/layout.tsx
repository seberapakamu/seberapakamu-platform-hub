import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://seberapakamu.id"),
  title: "Seberapa Kamu?",
  description: "Platform kuis kepribadian seru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" style={{ background: "#0F0F1A" }}>
      <body style={{ background: "#0F0F1A", margin: 0 }}>{children}</body>
    </html>
  );
}
