"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/utils/categories";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    excerpt: "",
    seo_title: "",
    seo_description: "",
    tags: "",
    category_slug: "",
  });

  useEffect(() => {
    // Fetch category IDs from API
    async function loadCategories() {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    }
    loadCategories();
  }, []);

  async function handleSave(publish: boolean) {
    if (!form.title || !form.content || !form.category_slug) return;
    setSaving(true);

    const category = categories.find((c) => c.slug === form.category_slug);
    if (!category) return;

    const slug =
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString(36);

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        excerpt: form.excerpt || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        category_id: category.id,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
        fact_check_status: "unverified",
        reading_time_minutes: Math.ceil(form.content.split(/\s+/).length / 200),
      }),
    });

    if (res.ok) {
      router.push("/admin/articles");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-heading">New Article</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving || !form.title || !form.content || !form.category_slug}
          >
            <Save className="h-4 w-4 mr-1" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || !form.title || !form.content || !form.category_slug}
          >
            <Eye className="h-4 w-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Optional subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown) *</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Write your article in markdown..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="min-h-[80px]"
              placeholder="Short description for article cards"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <Label>Category *</Label>
            <select
              value={form.category_slug}
              onChange={(e) =>
                setForm({ ...form, category_slug: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a category</option>
              {CATEGORY_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {CATEGORIES[slug].name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <Label className="text-sm font-medium">SEO</Label>
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
                placeholder="SEO title (auto from title if empty)"
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
                placeholder="Meta description"
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
                placeholder="diabetes, research, treatment"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
