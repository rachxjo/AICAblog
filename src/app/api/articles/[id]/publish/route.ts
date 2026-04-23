import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current status
  const { data: article } = await supabase
    .from("articles")
    .select("status")
    .eq("id", id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newStatus = article.status === "published" ? "draft" : "published";
  const update: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "published") {
    update.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("articles")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
