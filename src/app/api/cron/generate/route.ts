import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/pipeline";
import type { CategorySlug } from "@/types/database";

const VALID_CATEGORIES: CategorySlug[] = [
  "diabetes",
  "transplant",
  "bone-marrow",
  "general-health",
];

export async function GET() {
  try {
    // Pick random category
    const randomCategory =
      VALID_CATEGORIES[Math.floor(Math.random() * VALID_CATEGORIES.length)];

    // Run pipeline
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
    console.error("CRON ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      { status: 500 }
    );
  }
}