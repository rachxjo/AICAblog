"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

export function BookmarkButton({ articleId }: { articleId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const visitorId = getVisitorId();
    fetch(`/api/bookmarks?visitorId=${visitorId}`)
      .then((r) => r.json())
      .then((data) => {
        setBookmarked(data.bookmarks.includes(articleId));
        setLoading(false);
      });
  }, [articleId]);

  async function toggle() {
    const visitorId = getVisitorId();
    if (bookmarked) {
      await fetch(
        `/api/bookmarks?articleId=${articleId}&visitorId=${visitorId}`,
        { method: "DELETE" }
      );
      setBookmarked(false);
    } else {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: articleId, visitor_id: visitorId }),
      });
      setBookmarked(true);
    }
  }

  if (loading) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={bookmarked ? "text-primary" : "text-muted-foreground"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-1" />
      ) : (
        <Bookmark className="h-4 w-4 mr-1" />
      )}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
