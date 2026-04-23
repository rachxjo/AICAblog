import type { CategorySlug } from "@/types/database";

export const CATEGORY_SEARCH_QUERIES: Record<CategorySlug, string> = {
  diabetes:
    "(diabetes mellitus OR type 2 diabetes OR insulin resistance OR blood glucose) AND (therapy OR treatment OR clinical trial)",
  transplant:
    "(organ transplantation OR graft rejection OR immunosuppression OR kidney transplant) AND (outcomes OR survival OR clinical)",
  "bone-marrow":
    "(bone marrow transplantation OR hematopoietic stem cell OR stem cell therapy) AND (clinical OR treatment OR leukemia)",
  "general-health":
    "(public health OR preventive medicine OR clinical guidelines OR health outcomes) AND (study OR research OR trial)",
};

export function buildRankingPrompt(
  papers: { title: string; abstract: string }[]
): string {
  // Truncate abstracts to save tokens — first 300 chars is enough for ranking
  const paperList = papers
    .map(
      (p, i) =>
        `[${i}] ${p.title}\n${p.abstract.substring(0, 300)}${p.abstract.length > 300 ? "..." : ""}`
    )
    .join("\n\n");

  return `You are a medical research editor. Pick the 2 most newsworthy papers by clinical significance, novelty, and public interest.

${paperList}

Return a JSON array of the 2 best indices. Example: [3, 1]`;
}

export function buildArticlePrompt(paper: {
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  doi?: string;
}): string {
  return `You are a professional medical science journalist writing for an educated general audience.

Write a comprehensive, evidence-based health article based on this research paper:

Title: ${paper.title}
Authors: ${paper.authors}
Journal: ${paper.journal}
${paper.doi ? `DOI: ${paper.doi}` : ""}
Abstract: ${paper.abstract}

REQUIREMENTS:
- Write 800-1200 words
- Use this structure:
  1. **Engaging headline** (not the paper's title, but a news-style headline)
  2. **Key Takeaway** - One sentence summary of the most important finding
  3. **Introduction** - Context for why this research matters (2-3 paragraphs)
  4. **Key Findings** - What the researchers discovered (2-3 paragraphs with specifics)
  5. **Clinical Implications** - What this means for patients and doctors (1-2 paragraphs)
  6. **Study Details** - Brief methodology note (1 paragraph)
  7. **What This Means for You** - Practical takeaways for readers (1-2 paragraphs)
- Use inline citations like [1] when referencing the source paper
- Professional, educational tone
- NEVER make dosage recommendations or specific treatment advice
- NEVER use absolute language like "cures" or "proves" — use "suggests", "indicates", "may"
- Include a note that readers should consult their healthcare provider
- Write in markdown format

Return ONLY the article content in markdown, starting with the headline as an H1.`;
}

export function buildSEOPrompt(articleContent: string): string {
  return `Given this medical research article, generate SEO metadata.

Article:
${articleContent.substring(0, 2000)}

Return a JSON object with:
{
  "seo_title": "SEO-optimized title under 60 characters",
  "seo_description": "Meta description under 155 characters, compelling and informative",
  "slug": "url-friendly-slug-with-dashes",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "excerpt": "150-200 character excerpt for article cards",
  "reading_time_minutes": 5,
  "unsplash_search_terms": "2-3 word search term for a relevant medical photo"
}`;
}

export function buildFactCheckPrompt(
  articleContent: string,
  sourceAbstract: string
): string {
  return `You are a medical fact-checker. Analyze this AI-generated health article against its source research paper abstract.

SOURCE ABSTRACT:
${sourceAbstract}

GENERATED ARTICLE:
${articleContent}

For each factual claim in the article, determine:
1. Is it directly supported by the source abstract?
2. Is it an extrapolation beyond the source findings?
3. Does it use inappropriately absolute language?
4. Does it make treatment/dosage recommendations?

Return a JSON object:
{
  "overall_status": "verified" | "uncertain" | "flagged",
  "claims": [
    {
      "text": "the specific claim text",
      "source_sentence": "matching sentence from abstract or empty string",
      "status": "verified" | "uncertain" | "unverified" | "flagged",
      "confidence": 0.0-1.0,
      "reason": "why this status was assigned"
    }
  ],
  "warnings": ["list of any warnings about the article"],
  "medical_disclaimer_required": true
}

Be thorough. Flag any claims not directly supported by the source abstract.`;
}
