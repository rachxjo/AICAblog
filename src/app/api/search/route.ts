import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  if (!query || query.length < 2) {
    return NextResponse.json({ articles: [], total: 0 });
  }

  // Use Supabase full-text search
  const { data, count, error } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image_url, tags, reading_time_minutes, published_at, category:categories(slug, name)",
      { count: "exact" }
    )
    .eq("status", "published")
    .textSearch("search_vector", query, { type: "websearch" })
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

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
