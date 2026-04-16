import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

export interface ArticleRow {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  status: "draft" | "published";
  gambar_url: string | null;
  created_at: string;
  updated_at: string;
}

type ArticlePayload = Omit<ArticleRow, "id" | "created_at" | "updated_at">;

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validatePayload(body: Partial<ArticlePayload>): string[] {
  const errors: string[] = [];
  if (!body.judul || body.judul.trim() === "") errors.push("judul wajib diisi");
  if (!body.slug || body.slug.trim() === "") {
    errors.push("slug wajib diisi");
  } else if (!SLUG_REGEX.test(body.slug.trim())) {
    errors.push("slug harus URL-safe (huruf kecil, angka, dan tanda hubung)");
  }
  if (!body.konten || body.konten.trim() === "") errors.push("konten wajib diisi");
  if (!body.status || !["draft", "published"].includes(body.status))
    errors.push("status harus 'draft' atau 'published'");
  return errors;
}

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET /api/admin/articles — list articles
// Authenticated admins see all; unauthenticated see published only (via RLS)
export async function GET() {
  const user = await getAuthenticatedUser();
  const supabase = await createServerClient();

  const query = user
    ? supabase.from("articles").select("*").order("id", { ascending: true })
    : supabase.from("articles").select("*").eq("status", "published").order("id", { ascending: true });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/articles — create a new article (admin only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<ArticlePayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const errors = validatePayload(body);
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  const adminClient = await createServerClient();
  const { data, error } = await adminClient
    .from("articles")
    .insert({
      judul: body.judul!.trim(),
      slug: body.slug!.trim(),
      konten: body.konten!.trim(),
      status: body.status!,
      gambar_url: body.gambar_url ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
