import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export function buildArticleMetadata(article: {
  title: string;
  seo_title?: string | null;
  seo_description?: string | null;
  excerpt?: string | null;
  featured_image_url?: string | null;
  published_at?: string | null;
  tags?: string[];
  slug: string;
  category_slug: string;
}): Metadata {
  const title = article.seo_title || article.title;
  const description =
    article.seo_description || article.excerpt || `Read about ${article.title}`;
  const url = `${SITE_URL}/${article.category_slug}/${article.slug}`;

  return {
    title,
    description,
    keywords: article.tags,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.published_at || undefined,
      images: article.featured_image_url
        ? [{ url: article.featured_image_url }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.featured_image_url
        ? [article.featured_image_url]
        : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function buildCategoryMetadata(category: {
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  description?: string;
}): Metadata {
  const title = category.seo_title || `${category.name} | ${SITE_NAME}`;
  const description =
    category.seo_description ||
    category.description ||
    `Latest ${category.name} articles`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${category.slug}`,
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}/${category.slug}`,
    },
  };
}
