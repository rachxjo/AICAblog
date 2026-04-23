import type { CategorySlug } from "@/types/database";
import { CATEGORY_SEARCH_QUERIES } from "@/lib/gemini/prompts";

export interface FetchedPaper {
  pubmed_id?: string;
  semantic_scholar_id?: string;
  title: string;
  abstract: string;
  authors: { name: string; affiliation?: string }[];
  journal: string;
  published_date?: string;
  doi?: string;
  url: string;
}

// PubMed E-Utilities
async function fetchPubMed(
  category: CategorySlug,
  customTopic?: string
): Promise<FetchedPaper[]> {
  const query = customTopic || CATEGORY_SEARCH_QUERIES[category];
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
    query
  )}&datetype=pdat&reldate=30&retmax=5&retmode=json&sort=date`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids: string[] = searchData.esearchresult?.idlist || [];

  if (ids.length === 0) return [];

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(
    ","
  )}&retmode=xml`;
  const fetchRes = await fetch(fetchUrl);
  const xml = await fetchRes.text();

  return parsePubMedXml(xml);
}

function parsePubMedXml(xml: string): FetchedPaper[] {
  const papers: FetchedPaper[] = [];
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const block = match[1];

    const pmid = extractTag(block, "PMID");
    const title = extractTag(block, "ArticleTitle");
    const abstract = extractAbstract(block);
    const journal = extractTag(block, "Title");

    if (!title || !abstract) continue;

    // Extract authors
    const authors: { name: string }[] = [];
    const authorRegex =
      /<Author[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?<ForeName>(.*?)<\/ForeName>[\s\S]*?<\/Author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(block)) !== null) {
      authors.push({ name: `${authorMatch[2]} ${authorMatch[1]}` });
    }

    // Extract DOI
    const doiMatch = block.match(
      /<ArticleId IdType="doi">(.*?)<\/ArticleId>/
    );
    const doi = doiMatch ? doiMatch[1] : undefined;

    papers.push({
      pubmed_id: pmid || undefined,
      title: cleanXml(title),
      abstract: cleanXml(abstract),
      authors,
      journal: cleanXml(journal || ""),
      doi,
      url: pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : `https://doi.org/${doi}`,
    });
  }

  return papers;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function extractAbstract(xml: string): string | null {
  // Match all <AbstractText> tags (with or without attributes) and concatenate
  const regex = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
  const parts: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    parts.push(cleanXml(match[1]));
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

function cleanXml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

// Semantic Scholar
async function fetchSemanticScholar(
  category: CategorySlug,
  customTopic?: string
): Promise<FetchedPaper[]> {
  const query = customTopic || CATEGORY_SEARCH_QUERIES[category];
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
    query
  )}&limit=5&fields=title,abstract,authors,journal,externalIds,url,publicationDate&year=2025-2026`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  const papers: FetchedPaper[] = [];

  for (const paper of data.data || []) {
    if (!paper.title || !paper.abstract) continue;
    papers.push({
      semantic_scholar_id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      authors: (paper.authors || []).map((a: any) => ({ name: a.name })),
      journal: paper.journal?.name || "",
      published_date: paper.publicationDate,
      doi: paper.externalIds?.DOI,
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
    });
  }

  return papers;
}

// Deduplicate by DOI or title similarity
function deduplicatePapers(papers: FetchedPaper[]): FetchedPaper[] {
  const seen = new Map<string, FetchedPaper>();

  for (const paper of papers) {
    const key = paper.doi || paper.title.toLowerCase().substring(0, 80);
    if (!seen.has(key)) {
      seen.set(key, paper);
    }
  }

  return Array.from(seen.values());
}

export async function fetchPapers(
  category: CategorySlug,
  customTopic?: string
): Promise<FetchedPaper[]> {
  const [pubmedPapers, ssPapers] = await Promise.all([
    fetchPubMed(category, customTopic).catch(() => []),
    fetchSemanticScholar(category, customTopic).catch(() => []),
  ]);

  return deduplicatePapers([...pubmedPapers, ...ssPapers]);
}
