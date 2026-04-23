import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleCard } from "@/components/article/article-card";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `Articles tagged "${decoded}" | ${SITE_NAME}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image_url, featured_image_alt, tags, reading_time_minutes, published_at, category:categories(slug, name)"
    )
    .eq("status", "published")
    .contains("tags", [decoded])
    .order("published_at", { ascending: false })
    .limit(24);

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: `Tag: ${decoded}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold font-heading mb-6">
            Articles tagged &ldquo;{decoded}&rdquo;
          </h1>

          {!articles || articles.length === 0 ? (
            <p className="text-muted-foreground">
              No articles found with this tag.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
