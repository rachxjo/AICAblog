"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, X } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/date";

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  article: { title: string; slug: string } | null;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("comments")
      .select(
        "id, article_id, author_name, author_email, content, is_approved, created_at, article:articles(title, slug)"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (filter === "pending") query = query.eq("is_approved", false);
    if (filter === "approved") query = query.eq("is_approved", true);

    const { data } = await query;
    setComments((data as any) || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    const supabase = createClient();
    await supabase.from("comments").update({ is_approved: true }).eq("id", id);
    fetchComments();
  }

  async function handleReject(id: string) {
    const supabase = createClient();
    await supabase
      .from("comments")
      .update({ is_approved: false })
      .eq("id", id);
    fetchComments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment permanently?")) return;
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Comments</h1>

      <div className="flex gap-2">
        {(["pending", "approved", "all"] as const).map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments found.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.author_email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(comment.created_at)}
                      </span>
                      <Badge
                        variant={comment.is_approved ? "default" : "outline"}
                        className="text-xs"
                      >
                        {comment.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      On:{" "}
                      <span className="text-foreground">
                        {comment.article?.title || "Unknown article"}
                      </span>
                    </p>
                    <p className="text-sm">{comment.content}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!comment.is_approved && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleApprove(comment.id)}
                        title="Approve"
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    )}
                    {comment.is_approved && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleReject(comment.id)}
                        title="Reject"
                      >
                        <X className="h-3.5 w-3.5 text-yellow-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
