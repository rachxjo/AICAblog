import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/constants";
import { CATEGORY_SLUGS } from "@/lib/utils/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at, category:categories(slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...CATEGORY_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(
    (article: any) => ({
      url: `${SITE_URL}/${article.category?.slug || "general-health"}/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...articlePages];
}
