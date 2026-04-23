import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPapers } from "./fetcher";
import { selectTopPapers } from "./analyzer";
import { generateArticle } from "./generator";
import { factCheckArticle } from "./fact-checker";
import { fetchUnsplashImage } from "./image-selector";
import type { CategorySlug } from "@/types/database";

export interface PipelineResult {
  pipelineRunId: string;
  papersFetched: number;
  articlesGenerated: number;
  errors: string[];
}

export async function runPipeline(
  category: CategorySlug,
  triggerType: "cron" | "manual",
  customTopic?: string,
  triggeredBy?: string,
  maxArticles: number = 1
): Promise<PipelineResult> {
  const supabase = createAdminClient();
  const errors: string[] = [];

  // Get category ID
  const { data: categoryRow } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (!categoryRow) {
    throw new Error(`Category not found: ${category}`);
  }

  // Create pipeline run record
  const { data: pipelineRun, error: pipelineError } = await supabase
    .from("pipeline_runs")
    .insert({
      trigger_type: triggerType,
      triggered_by: triggeredBy || null,
      category_id: categoryRow.id,
      status: "fetching",
    })
    .select("id")
    .single();

  if (pipelineError) {
    console.error("Pipeline insert error:", pipelineError.message);
    throw new Error(pipelineError.message);
  }

  if (!pipelineRun || !pipelineRun.id) {
    throw new Error("Failed to create pipeline run record");
  }

  const runId = pipelineRun.id;

  try {
    // Step 1: Fetch papers
    await supabase
      .from("pipeline_runs")
      .update({ status: "fetching" })
      .eq("id", runId);

    const papers = await fetchPapers(category, customTopic);

    await supabase
      .from("pipeline_runs")
      .update({ papers_fetched: papers.length })
      .eq("id", runId);

    if (papers.length === 0) {
      await supabase
        .from("pipeline_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return {
        pipelineRunId: runId,
        papersFetched: 0,
        articlesGenerated: 0,
        errors: [],
      };
    }

    // Step 2: Analyze papers
    await supabase
      .from("pipeline_runs")
      .update({ status: "analyzing" })
      .eq("id", runId);

    const selectedPapers = await selectTopPapers(papers, maxArticles);

    // Step 3: Generate articles
    await supabase
      .from("pipeline_runs")
      .update({ status: "generating" })
      .eq("id", runId);

    let articlesGenerated = 0;

    for (const paper of selectedPapers) {
      try {
        let storedPaperId: string | null = null;

        // Check if paper already exists
        if (paper.pubmed_id) {
          const { data: existing } = await supabase
            .from("source_papers")
            .select("id")
            .eq("pubmed_id", paper.pubmed_id)
            .single();

          if (existing) storedPaperId = existing.id;
        }

        // Insert paper if not exists
        if (!storedPaperId) {
          const { data: inserted, error: insertError } = await supabase
            .from("source_papers")
            .insert({
              pubmed_id: paper.pubmed_id || null,
              semantic_scholar_id: paper.semantic_scholar_id || null,
              title: paper.title,
              abstract: paper.abstract,
              authors: paper.authors,
              journal: paper.journal,
              published_date: paper.published_date || null,
              doi: paper.doi || null,
              url: paper.url,
              category_id: categoryRow.id,
              used_in_article: true,
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to store paper:", insertError.message);
          }

          storedPaperId = inserted?.id || null;
        }

        // Generate article
        const generated = await generateArticle(paper);

        const slug = `${generated.slug}-${Date.now().toString(36)}`;

        // Fact-check
        await supabase
          .from("pipeline_runs")
          .update({ status: "fact_checking" })
          .eq("id", runId);

        const factCheckReport = await factCheckArticle(
          generated.content,
          paper.abstract
        );

        // Image
        const image = await fetchUnsplashImage(
          generated.unsplash_search_terms
        );

        // ✅ STORE AS PUBLISHED (FIXED)
        const { data: article } = await supabase
          .from("articles")
          .insert({
            slug,
            title:
              generated.content.match(/^#\s+(.+)/m)?.[1] || paper.title,
            content: generated.content,
            excerpt: generated.excerpt,
            featured_image_url: image?.url || null,
            featured_image_alt: image?.alt || null,
            featured_image_credit: image?.credit || null,
            category_id: categoryRow.id,
            status: "published", // ✅ KEY CHANGE
            fact_check_status: factCheckReport.overall_status,
            fact_check_report: factCheckReport as any,
            seo_title: generated.seo_title,
            seo_description: generated.seo_description,
            tags: generated.tags,
            reading_time_minutes: generated.reading_time_minutes,
            pipeline_run_id: runId,
          })
          .select("id")
          .single();

        // Link citation
        if (article && storedPaperId) {
          const { error: citError } = await supabase
            .from("article_citations")
            .insert({
              article_id: article.id,
              paper_id: storedPaperId,
              citation_number: 1,
              context: `Based on: ${paper.title}`,
            });

          if (citError) {
            console.error("Failed to link citation:", citError.message);
          }
        }

        articlesGenerated++;
      } catch (err) {
        errors.push(
          `Failed to generate article from "${paper.title}": ${String(err)}`
        );
      }
    }

    // Complete
    await supabase
      .from("pipeline_runs")
      .update({
        status: "completed",
        articles_generated: articlesGenerated,
        error_log: errors.length > 0 ? errors.join("\n") : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return {
      pipelineRunId: runId,
      papersFetched: papers.length,
      articlesGenerated,
      errors,
    };
  } catch (err) {
    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        error_log: String(err),
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    throw err;
  }
}