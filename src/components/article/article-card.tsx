import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  tags: string[];
  category: {
    slug: string;
    name: string;
  } | null;
}

export function ArticleCard({ article }: { article: ArticleCardProps }) {
  const href = `/${article.category?.slug || "general-health"}/${article.slug}`;

  return (
    <Link href={href}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        {article.featured_image_url && (
          <div className="relative aspect-video">
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt || article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-4">
          {article.category && (
            <Badge variant="outline" className="mb-2 text-xs">
              {article.category.name}
            </Badge>
          )}
          <h3 className="font-semibold font-heading line-clamp-2 mb-1">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.published_at && (
              <span>{formatDateShort(article.published_at)}</span>
            )}
            {article.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.reading_time_minutes} min read
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
