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

    // ✅ IMPORTANT: MUST await (fixes Vercel issue)
    const result = await runPipeline(randomCategory, "cron");

    return NextResponse.json({
      success: true,
      category: randomCategory,
      pipelineRunId: result.pipelineRunId,
      papersFetched: result.papersFetched,
      articlesGenerated: result.articlesGenerated,
      errors: result.errors,
    });
  } catch (err) {
    console.error("AUTO GENERATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
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

  try {
    const body = await request.json();

    const category = body.category as CategorySlug;
    const customTopic = body.customTopic as string | undefined;

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    const result = await runPipeline(
      category,
      "manual",
      customTopic,
      userId
    );

    return NextResponse.json({
      success: true,
      pipelineRunId: result.pipelineRunId,
      papersFetched: result.papersFetched,
      articlesGenerated: result.articlesGenerated,
      errors: result.errors,
    });
  } catch (err) {
    console.error("MANUAL GENERATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      { status: 500 }
    );
  }
}