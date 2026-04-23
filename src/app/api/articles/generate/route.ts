import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline/pipeline";
import type { CategorySlug } from "@/types/database";

const VALID_CATEGORIES: CategorySlug[] = [
  "diabetes",
  "transplant",
  "bone-marrow",
  "general-health",
];

// ✅ AUTOMATION (GET)
export async function GET() {
  try {
    const randomCategory =
      VALID_CATEGORIES[Math.floor(Math.random() * VALID_CATEGORIES.length)];

    // ⚡ KEY CHANGE: removed "await"
    runPipeline(randomCategory, "cron");

    return NextResponse.json({
      success: true,
      message: "Pipeline started",
      category: randomCategory,
    });
  } catch (err) {
    console.error("AUTO GENERATE ERROR:", err);

    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

// ✅ MANUAL (POST)
export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userId = user?.id;
  } catch {
    // ignore auth failure
  }

  const body = await request.json();
  const category = body.category as CategorySlug;
  const customTopic = body.customTopic as string | undefined;

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  try {
    const result = await runPipeline(
      category,
      "manual",
      customTopic,
      userId
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}