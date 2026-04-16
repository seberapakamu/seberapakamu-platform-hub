import "@/app/globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={nunito.variable}>{children}</div>;
}
