"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/article/article-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query.trim())}`
    );
    const data = await res.json();
    setResults(data.articles || []);
    setTotal(data.total || 0);
    setSearching(false);
    setSearched(true);
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: "Search" }]} />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold font-heading mb-6 text-center">
          Search Articles
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for diabetes, transplant, stem cell..."
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            <Search className="h-4 w-4 mr-1" />
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {searched && (
          <p className="text-sm text-muted-foreground mb-6">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {results.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {searched && results.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No articles found. Try a different search term.
          </p>
        )}
      </div>
    </div>
  );
}
