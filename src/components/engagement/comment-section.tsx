"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/date";
import type { Comment } from "@/types/database";

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<(Comment & { replies: Comment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      });
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, article_id: articleId }),
    });

    if (res.ok) {
      setSubmitted(true);
      setForm({ author_name: "", author_email: "", content: "" });
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h2>

      {/* Comment List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
              {/* Replies */}
              {comment.replies?.map((reply) => (
                <div
                  key={reply.id}
                  className="ml-8 rounded-lg border bg-muted/50 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {reply.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            Thank you! Your comment has been submitted and is awaiting
            moderation.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="author_name" className="text-xs">
                Name
              </Label>
              <Input
                id="author_name"
                value={form.author_name}
                onChange={(e) =>
                  setForm({ ...form, author_name: e.target.value })
                }
                required
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="author_email" className="text-xs">
                Email (not published)
              </Label>
              <Input
                id="author_email"
                type="email"
                value={form.author_email}
                onChange={(e) =>
                  setForm({ ...form, author_email: e.target.value })
                }
                required
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="comment_content" className="text-xs">
              Comment
            </Label>
            <Textarea
              id="comment_content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              placeholder="Share your thoughts..."
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            <Send className="h-4 w-4 mr-1" />
            {submitting ? "Submitting..." : "Post Comment"}
          </Button>
        </form>
      )}
    </section>
  );
}
