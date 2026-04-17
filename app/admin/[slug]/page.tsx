import { notFound, redirect } from "next/navigation";
import { MODULES } from "@/lib/modules.config";
import { createServerClient } from "@/lib/supabase.server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminSlugPage({ params }: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;

  const module = MODULES.find((m) => m.slug === slug);

  if (!module) {
    notFound();
  }

  if (module.status === "coming_soon") {
    redirect("/admin?info=coming-soon");
  }

  // Active module: redirect to its panel
  if (slug === "wibu") {
    redirect("/admin/wibu");
  }

  // Active module without a panel yet → 404
  notFound();
}
