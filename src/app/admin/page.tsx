import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, MessageSquare, Users } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/date";
import Link from "next/link";

async function getStats() {
  const supabase = createAdminClient();

  const [articles, drafts, comments, subscribers] = await Promise.all([
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false),
    supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  return {
    published: articles.count || 0,
    drafts: drafts.count || 0,
    pendingComments: comments.count || 0,
    subscribers: subscribers.count || 0,
  };
}

async function getRecentDrafts() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, status, fact_check_status, created_at, category:categories(name, slug)")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(10);

  return data || [];
}

async function getRecentPipelineRuns() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pipeline_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(5);

  return data || [];
}

const STATUS_COLORS: Record<string, string> = {
  verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  uncertain: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  unverified: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  flagged: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default async function AdminDashboard() {
  const [stats, recentDrafts, pipelineRuns] = await Promise.all([
    getStats(),
    getRecentDrafts(),
    getRecentPipelineRuns(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts Pending
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Comments
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingComments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscribers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Drafts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No drafts yet. Generate some articles!
              </p>
            ) : (
              <ul className="space-y-3">
                {recentDrafts.map((draft: any) => (
                  <li key={draft.id}>
                    <Link
                      href={`/admin/articles/${draft.id}`}
                      className="block hover:bg-muted rounded-md p-2 -m-2 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {draft.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {draft.category?.name}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            STATUS_COLORS[draft.fact_check_status] || ""
                          }`}
                        >
                          {draft.fact_check_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(draft.created_at)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Runs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pipeline runs yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {pipelineRuns.map((run: any) => (
                  <li
                    key={run.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {run.trigger_type === "cron" ? "Scheduled" : "Manual"}{" "}
                        run
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {run.papers_fetched} papers, {run.articles_generated}{" "}
                        articles
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          run.status === "completed" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {run.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeDate(run.started_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
