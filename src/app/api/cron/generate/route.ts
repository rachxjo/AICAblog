import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/pipeline";
import type { CategorySlug } from "@/types/database";

const VALID_CATEGORIES: CategorySlug[] = [
  "diabetes",
  "transplant",
  "bone-marrow",
  "general-health",
];

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as CategorySlug;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Invalid or missing category" },
      { status: 400 }
    );
  }

  try {
    const result = await runPipeline(category, "cron");
    return NextResponse.json({
      success: true,
      papersFetched: result.papersFetched,
      articlesGenerated: result.articlesGenerated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
