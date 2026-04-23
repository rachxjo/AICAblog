"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date";
import { CATEGORIES } from "@/lib/utils/categories";
import type { ArticleStatus, CategorySlug } from "@/types/database";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  fact_check_status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  category_id: string;
  category: { name: string; slug: string } | null;
}

function getCategoryName(article: ArticleRow): string {
  if (article.category?.name) return article.category.name;
  // Fallback: try to match from known categories
  const slug = article.category?.slug as CategorySlug | undefined;
  if (slug && CATEGORIES[slug]) return CATEGORIES[slug].name;
  return "Uncategorized";
}

const STATUS_BADGE: Record<string, { variant: "default" | "outline" | "secondary"; label: string }> = {
  draft: { variant: "outline", label: "Draft" },
  review: { variant: "secondary", label: "Review" },
  published: { variant: "default", label: "Published" },
  archived: { variant: "outline", label: "Archived" },
};

const FACT_CHECK_COLORS: Record<string, string> = {
  verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  uncertain: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  unverified: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  flagged: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  async function fetchArticles() {
    setLoading(true);
    const params = activeTab !== "all" ? `?status=${activeTab}` : "";
    const res = await fetch(`/api/admin/articles${params}`);
    const data = await res.json();
    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    fetchArticles();
  }

  async function handleStatusChange(id: string, status: ArticleStatus) {
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(status === "published"
          ? { published_at: new Date().toISOString() }
          : {}),
      }),
    });
    fetchArticles();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Articles</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/articles/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
          <Link href="/admin/articles/generate">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Articles
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading...
            </p>
          ) : articles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No articles found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fact Check</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => {
                  const statusInfo = STATUS_BADGE[article.status];
                  return (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(article)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo?.variant || "outline"} className="text-xs">
                          {statusInfo?.label || article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            FACT_CHECK_COLORS[article.fact_check_status] || ""
                          }`}
                        >
                          {article.fact_check_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateShort(
                          article.published_at || article.created_at
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {article.view_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="ghost" size="icon-sm">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {article.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleStatusChange(article.id, "published")
                              }
                              title="Publish"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {article.status === "published" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleStatusChange(article.id, "archived")
                              }
                              title="Archive"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(article.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
