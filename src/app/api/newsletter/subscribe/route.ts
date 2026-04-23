import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { email, name, categories } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("subscribers").upsert(
    {
      email: email.toLowerCase().trim(),
      name: name || null,
      categories: categories || [],
      is_active: true,
      confirmed_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
