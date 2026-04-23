import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to bypass RLS for admin operations
  const admin = createAdminClient();

  const { data: article, error: articleError } = await admin
    .from("articles")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: citations } = await admin
    .from("article_citations")
    .select("*, paper:source_papers(*)")
    .eq("article_id", id)
    .order("citation_number");

  return NextResponse.json({ article, citations: citations || [] });
}
