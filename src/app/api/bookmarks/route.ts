import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");

  if (!visitorId) {
    return NextResponse.json({ bookmarks: [] });
  }

  const { data } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("visitor_id", visitorId);

  return NextResponse.json({
    bookmarks: (data || []).map((b) => b.article_id),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { article_id, visitor_id } = body;

  if (!article_id || !visitor_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("bookmarks")
    .upsert({ article_id, visitor_id }, { onConflict: "article_id,visitor_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const visitorId = searchParams.get("visitorId");

  if (!articleId || !visitorId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await supabase
    .from("bookmarks")
    .delete()
    .eq("article_id", articleId)
    .eq("visitor_id", visitorId);

  return NextResponse.json({ success: true });
}
