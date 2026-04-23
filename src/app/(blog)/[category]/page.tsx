import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryConfig } from "@/lib/utils/categories";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleCard } from "@/components/article/article-card";
import { Activity, Dna, Droplets, Heart } from "lucide-react";
import type { CategorySlug } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets,
  Heart,
  Dna,
  Activity,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const config = CATEGORIES[category as CategorySlug];
  if (!config) return {};
  return buildCategoryMetadata(config);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const config = CATEGORIES[category as CategorySlug];
  if (!config) notFound();

  const supabase = await createClient();

  // Get category ID
  const { data: categoryRow } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  // Get articles
  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, featured_image_url, featured_image_alt, tags, reading_time_minutes, published_at, category:categories(slug, name)"
    )
    .eq("status", "published")
    .eq("category_id", categoryRow?.id || "")
    .order("published_at", { ascending: false })
    .limit(24);

  const Icon = ICON_MAP[config.icon] || Activity;

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: config.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Category Header */}
          <div className={`rounded-lg p-6 mb-6 ${config.bgColor}`}>
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`h-6 w-6 ${config.color}`} />
              <h1 className="text-2xl font-bold font-heading">{config.name}</h1>
            </div>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          {/* Articles Grid */}
          {!articles || articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              No articles published yet in this category.
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
