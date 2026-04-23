"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Save,
  Eye,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/utils/categories";
import type { Article, FactCheckReport, ArticleCitation, SourcePaper } from "@/types/database";

const FACT_ICONS: Record<string, React.ElementType> = {
  verified: CheckCircle,
  uncertain: AlertTriangle,
  unverified: HelpCircle,
  flagged: XCircle,
};

const FACT_COLORS: Record<string, string> = {
  verified: "text-green-600",
  uncertain: "text-yellow-600",
  unverified: "text-gray-500",
  flagged: "text-red-600",
};

export default function ArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [citations, setCitations] = useState<(ArticleCitation & { paper: SourcePaper })[]>([]);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    excerpt: "",
    seo_title: "",
    seo_description: "",
    tags: "",
    category_id: "",
  });

  useEffect(() => {
    async function load() {
      const [articleRes, catRes] = await Promise.all([
        fetch(`/api/admin/articles/${id}`),
        fetch("/api/categories"),
      ]);

      if (catRes.ok) {
        setCategoryOptions(await catRes.json());
      }

      if (!articleRes.ok) return;
      const data = await articleRes.json();

      if (data.article) {
        setArticle(data.article as any);
        setForm({
          title: data.article.title || "",
          subtitle: data.article.subtitle || "",
          content: data.article.content || "",
          excerpt: data.article.excerpt || "",
          seo_title: data.article.seo_title || "",
          seo_description: data.article.seo_description || "",
          tags: (data.article.tags || []).join(", "),
          category_id: data.article.category_id || "",
        });
      }

      if (data.citations) {
        setCitations(data.citations as any);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        excerpt: form.excerpt || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        category_id: form.category_id,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    setSaving(false);
  }

  async function handlePublish() {
    await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    router.push("/admin/articles");
  }

  async function handleArchive() {
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    router.push("/admin/articles");
  }

  if (!article) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const factReport = article.fact_check_report as FactCheckReport | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-heading">Edit Article</h1>
          <Badge variant="outline">{article.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          {article.status !== "published" && (
            <Button onClick={handlePublish}>
              <Eye className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          {article.status === "published" && (
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[500px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-4">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="seo_title" className="text-xs">
                  SEO Title
                </Label>
                <Input
                  id="seo_title"
                  value={form.seo_title}
                  onChange={(e) =>
                    setForm({ ...form, seo_title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="seo_description" className="text-xs">
                  SEO Description
                </Label>
                <Textarea
                  id="seo_description"
                  value={form.seo_description}
                  onChange={(e) =>
                    setForm({ ...form, seo_description: e.target.value })
                  }
                  className="min-h-[60px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tags" className="text-xs">
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {article.featured_image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={article.featured_image_url}
                  alt={article.featured_image_alt || "Featured"}
                  className="w-full rounded-md"
                />
                {article.featured_image_credit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Photo by {article.featured_image_credit} / Unsplash
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fact Check Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fact Check Report</CardTitle>
            </CardHeader>
            <CardContent>
              {!factReport ? (
                <p className="text-xs text-muted-foreground">
                  No fact-check report available.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Overall:</span>
                    <Badge
                      className={`text-xs ${FACT_COLORS[factReport.overall_status]}`}
                    >
                      {factReport.overall_status}
                    </Badge>
                  </div>

                  {factReport.warnings.length > 0 && (
                    <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-2">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Warnings
                      </p>
                      {factReport.warnings.map((w, i) => (
                        <p
                          key={i}
                          className="text-xs text-yellow-700 dark:text-yellow-300"
                        >
                          {w}
                        </p>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {factReport.claims.map((claim, i) => {
                      const Icon = FACT_ICONS[claim.status] || HelpCircle;
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <Icon
                            className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                              FACT_COLORS[claim.status]
                            }`}
                          />
                          <div>
                            <p className="text-xs">{claim.text}</p>
                            {claim.reason && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {claim.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Citations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Source Citations</CardTitle>
            </CardHeader>
            <CardContent>
              {citations.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No citations linked.
                </p>
              ) : (
                <ol className="space-y-2 list-decimal list-inside">
                  {citations.map((cit) => (
                    <li key={cit.paper_id} className="text-xs">
                      <a
                        href={cit.paper?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {cit.paper?.title}
                      </a>
                      {cit.paper?.journal && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {cit.paper.journal}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
