import { generateJSON } from "@/lib/gemini/client";
import { buildRankingPrompt } from "@/lib/gemini/prompts";
import type { FetchedPaper } from "./fetcher";

export async function selectTopPapers(
  papers: FetchedPaper[],
  maxCount: number = 2
): Promise<FetchedPaper[]> {
  if (papers.length === 0) return [];
  if (papers.length <= maxCount) return papers;

  const prompt = buildRankingPrompt(
    papers.map((p) => ({ title: p.title, abstract: p.abstract }))
  );

  try {
    const rankedIndices = await generateJSON<number[]>(prompt);

    return rankedIndices
      .slice(0, maxCount)
      .map((i) => papers[i])
      .filter(Boolean);
  } catch {
    // Fallback: just take the first N
    return papers.slice(0, maxCount);
  }
}
