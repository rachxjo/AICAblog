import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json(
      { error: "articleId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build threaded structure
  const comments = data || [];
  const rootComments = comments.filter((c) => !c.parent_id);
  const childMap = new Map<string, typeof comments>();

  for (const comment of comments) {
    if (comment.parent_id) {
      const children = childMap.get(comment.parent_id) || [];
      children.push(comment);
      childMap.set(comment.parent_id, children);
    }
  }

  const threaded = rootComments.map((c) => ({
    ...c,
    replies: childMap.get(c.id) || [],
  }));

  return NextResponse.json(threaded);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { article_id, parent_id, author_name, author_email, content } = body;

  if (!article_id || !author_name || !author_email || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Basic validation
  if (content.length > 2000) {
    return NextResponse.json(
      { error: "Comment too long (max 2000 characters)" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_id,
      parent_id: parent_id || null,
      author_name: author_name.substring(0, 100),
      author_email: author_email.substring(0, 255),
      content: content.substring(0, 2000),
      is_approved: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
