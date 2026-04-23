"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, CheckCircle, XCircle } from "lucide-react";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/utils/categories";
import type { CategorySlug } from "@/types/database";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

export default function GeneratePage() {
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>(
    [...CATEGORY_SLUGS]
  );
  const [customTopic, setCustomTopic] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function toggleCategory(slug: CategorySlug) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function addLog(message: string, type: LogEntry["type"] = "info") {
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), message, type },
    ]);
  }

  async function handleGenerate() {
    setRunning(true);
    setLogs([]);
    const categoriesToRun =
      selectedCategories.length > 0 ? selectedCategories : CATEGORY_SLUGS;
    addLog("Starting article generation pipeline...");

    for (const category of categoriesToRun) {
      addLog(`Processing category: ${CATEGORIES[category].name}`);
      try {
        const res = await fetch("/api/articles/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            customTopic: customTopic || undefined,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          addLog(
            `Generated ${data.articlesGenerated} article(s) for ${CATEGORIES[category].name}` +
              (data.errors?.length
                ? ` (${data.errors.length} warning(s))`
                : ""),
            data.articlesGenerated > 0 ? "success" : "error"
          );
          if (data.errors?.length) {
            data.errors.forEach((e: string) => addLog(`  Warning: ${e}`, "error"));
          }
        } else {
          addLog(
            `Failed for ${CATEGORIES[category].name}: ${data.error || res.statusText}`,
            "error"
          );
        }
      } catch (err) {
        addLog(
          `Error processing ${CATEGORIES[category].name}: ${String(err)}`,
          "error"
        );
      }
    }

    addLog("Pipeline complete.", "success");
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Generate Articles</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_SLUGS.map((slug) => (
                  <Badge
                    key={slug}
                    variant={
                      selectedCategories.includes(slug)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleCategory(slug)}
                  >
                    {CATEGORIES[slug].name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave none selected to generate for all categories.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTopic">
                Custom Topic (optional override)
              </Label>
              <Input
                id="customTopic"
                placeholder="e.g., CRISPR gene editing for diabetes"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default research queries per category.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Articles
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Log</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Click &quot;Generate Articles&quot; to start the pipeline.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {log.type === "success" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    ) : log.type === "error" ? (
                      <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                    ) : (
                      <span className="text-muted-foreground w-3.5 shrink-0 text-center">
                        &bull;
                      </span>
                    )}
                    <span className="text-muted-foreground">{log.time}</span>
                    <span
                      className={
                        log.type === "error"
                          ? "text-red-600"
                          : log.type === "success"
                          ? "text-green-600"
                          : ""
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
