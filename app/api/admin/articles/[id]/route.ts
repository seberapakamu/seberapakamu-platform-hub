import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

type ArticleUpdatePayload = {
  judul?: string;
  slug?: string;
  konten?: string;
  status?: "draft" | "published";
  gambar_url?: string | null;
};

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validatePayload(body: ArticleUpdatePayload): string[] {
  const errors: string[] = [];
  if (body.judul !== undefined && body.judul.trim() === "")
    errors.push("judul tidak boleh kosong");
  if (body.slug !== undefined) {
    if (body.slug.trim() === "") {
      errors.push("slug tidak boleh kosong");
    } else if (!SLUG_REGEX.test(body.slug.trim())) {
      errors.push("slug harus URL-safe (huruf kecil, angka, dan tanda hubung)");
    }
  }
  if (body.konten !== undefined && body.konten.trim() === "")
    errors.push("konten tidak boleh kosong");
  if (body.status !== undefined && !["draft", "published"].includes(body.status))
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

// PUT /api/admin/articles/[id] — update an article (admin only, partial updates allowed)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  let body: ArticleUpdatePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const errors = validatePayload(body);
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  const updates: Record<string, unknown> = {};
  if (body.judul !== undefined) updates.judul = body.judul.trim();
  if (body.slug !== undefined) updates.slug = body.slug.trim();
  if (body.konten !== undefined) updates.konten = body.konten.trim();
  if (body.status !== undefined) updates.status = body.status;
  if (body.gambar_url !== undefined) updates.gambar_url = body.gambar_url;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Tidak ada field yang diupdate" }, { status: 400 });

  const adminClient = await createServerClient();
  const { data, error } = await adminClient
    .from("articles")
    .update(updates)
    .eq("id", numId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/articles/[id] — delete an article (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const adminClient = await createServerClient();
  const { error } = await adminClient.from("articles").delete().eq("id", numId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
