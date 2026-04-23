import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ARTICLES_PER_PAGE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status") || "published";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(
    searchParams.get("limit") || String(ARTICLES_PER_PAGE)
  );
  const offset = (page - 1) * limit;

  let query = supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image_url, featured_image_alt, tags, reading_time_minutes, published_at, created_at, view_count, category:categories(slug, name, color)",
      { count: "exact" }
    )
    .eq("status", status)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category.slug", category);
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("articles")
    .insert({
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || null,
      content: body.content,
      excerpt: body.excerpt || null,
      featured_image_url: body.featured_image_url || null,
      featured_image_alt: body.featured_image_alt || null,
      featured_image_credit: body.featured_image_credit || null,
      category_id: body.category_id,
      author_id: user.id,
      status: body.status || "draft",
      fact_check_status: body.fact_check_status || "unverified",
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      tags: body.tags || [],
      reading_time_minutes: body.reading_time_minutes || null,
      published_at: body.published_at || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
