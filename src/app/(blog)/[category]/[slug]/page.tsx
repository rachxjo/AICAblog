import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/utils/categories";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleContent } from "@/components/article/article-content";
import { CitationList } from "@/components/article/citation-list";
import { FactCheckBadge } from "@/components/article/fact-check-badge";
import { ShareButtons } from "@/components/engagement/share-buttons";
import { BookmarkButton } from "@/components/engagement/bookmark-button";
import { CommentSection } from "@/components/engagement/comment-section";
import { ArticleCard } from "@/components/article/article-card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { SITE_URL, MEDICAL_DISCLAIMER } from "@/lib/constants";
import type { CategorySlug, FactCheckStatus } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("title, seo_title, seo_description, excerpt, featured_image_url, published_at, tags, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) return {};

  return buildArticleMetadata({
    ...article,
    category_slug: category,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const categoryConfig = CATEGORIES[category as CategorySlug];
  if (!categoryConfig) notFound();

  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  // Fetch citations
  const { data: citations } = await supabase
    .from("article_citations")
    .select("*, paper:source_papers(*)")
    .eq("article_id", article.id)
    .order("citation_number");

  // Fetch related articles
  const { data: related } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image_url, featured_image_alt, tags, reading_time_minutes, published_at, category:categories(slug, name)"
    )
    .eq("status", "published")
    .eq("category_id", article.category_id)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3);

  // Increment view count (fire and forget)
  supabase
    .from("articles")
    .update({ view_count: (article.view_count || 0) + 1 })
    .eq("id", article.id)
    .then();

  const articleUrl = `${SITE_URL}/${category}/${slug}`;

  // Structured data
  const articleSchema = buildArticleSchema(
    article as any,
    article.category as any,
    (citations || []).map((c: any) => c.paper).filter(Boolean)
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: categoryConfig.name, url: `/${category}` },
    { name: article.title, url: `/${category}/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: categoryConfig.name, href: `/${category}` },
            { label: article.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Article Header */}
            <header className="mb-6">
              <Badge variant="outline" className="mb-3">
                {categoryConfig.name}
              </Badge>
              <h1 className="text-3xl font-bold font-heading mb-3">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-lg text-muted-foreground mb-3">
                  {article.subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {article.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(article.published_at)}
                  </span>
                )}
                {article.reading_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.reading_time_minutes} min read
                  </span>
                )}
                <FactCheckBadge
                  status={article.fact_check_status as FactCheckStatus}
                />
              </div>
            </header>

            {/* Featured Image */}
            {article.featured_image_url && (
              <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
                <Image
                  src={article.featured_image_url}
                  alt={article.featured_image_alt || article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                {article.featured_image_credit && (
                  <p className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/40 px-2 py-1 rounded">
                    Photo by {article.featured_image_credit} / Unsplash
                  </p>
                )}
              </div>
            )}

            {/* Article Content */}
            <ArticleContent content={article.content} />

            {/* Medical Disclaimer */}
            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Disclaimer:</strong> {MEDICAL_DISCLAIMER}
              </p>
            </div>

            {/* Citations */}
            <CitationList citations={(citations as any) || []} />

            {/* Tags & Share */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {(article.tags || []).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <ShareButtons url={articleUrl} title={article.title} />
                <BookmarkButton articleId={article.id} />
              </div>
            </div>

            {/* Related Articles */}
            {related && related.length > 0 && (
              <section className="mt-8 border-t pt-6">
                <h2 className="text-lg font-bold font-heading mb-4">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((r: any) => (
                    <ArticleCard key={r.id} article={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <CommentSection articleId={article.id} />
          </div>

          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
