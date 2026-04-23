import { generateJSON } from "@/lib/gemini/client";
import { buildFactCheckPrompt } from "@/lib/gemini/prompts";
import type { FactCheckReport } from "@/types/database";

export async function factCheckArticle(
  articleContent: string,
  sourceAbstract: string
): Promise<FactCheckReport> {
  try {
    const report = await generateJSON<FactCheckReport>(
      buildFactCheckPrompt(articleContent, sourceAbstract)
    );

    // Ensure required fields
    return {
      overall_status: report.overall_status || "unverified",
      claims: report.claims || [],
      warnings: report.warnings || [],
      medical_disclaimer_required: report.medical_disclaimer_required ?? true,
    };
  } catch {
    return {
      overall_status: "unverified",
      claims: [],
      warnings: ["Fact-check failed — manual review required"],
      medical_disclaimer_required: true,
    };
  }
}
