import { SITE_NAME, SITE_URL } from "@/lib/constants";
import type { Article, Category, SourcePaper } from "@/types/database";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "AI-powered medical research blog delivering evidence-based health articles.",
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildArticleSchema(
  article: Article,
  category: Category,
  citations: SourcePaper[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.seo_description,
    image: article.featured_image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${category.slug}/${article.slug}`,
    },
    citation: citations.map((paper) => ({
      "@type": "ScholarlyArticle",
      name: paper.title,
      url: paper.url,
      author: paper.authors?.map((a) => ({
        "@type": "Person",
        name: a.name,
      })),
    })),
  };
}
