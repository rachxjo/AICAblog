import { generateText, generateJSON } from "@/lib/gemini/client";
import { buildArticlePrompt, buildSEOPrompt } from "@/lib/gemini/prompts";
import type { FetchedPaper } from "./fetcher";

export interface GeneratedArticle {
  content: string;
  seo_title: string;
  seo_description: string;
  slug: string;
  tags: string[];
  excerpt: string;
  reading_time_minutes: number;
  unsplash_search_terms: string;
}

export async function generateArticle(
  paper: FetchedPaper
): Promise<GeneratedArticle> {
  // Generate article content
  const content = await generateText(
    buildArticlePrompt({
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors.map((a) => a.name).join(", "),
      journal: paper.journal,
      doi: paper.doi,
    })
  );

  // Generate SEO metadata
  const seo = await generateJSON<{
    seo_title: string;
    seo_description: string;
    slug: string;
    tags: string[];
    excerpt: string;
    reading_time_minutes: number;
    unsplash_search_terms: string;
  }>(buildSEOPrompt(content));

  return {
    content,
    seo_title: seo.seo_title,
    seo_description: seo.seo_description,
    slug: seo.slug,
    tags: seo.tags,
    excerpt: seo.excerpt,
    reading_time_minutes: seo.reading_time_minutes || 5,
    unsplash_search_terms: seo.unsplash_search_terms || "medical research",
  };
}
