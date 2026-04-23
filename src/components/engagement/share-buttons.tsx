"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" />
        Share:
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
            "_blank"
          )
        }
        title="Share on X"
      >
        <span className="text-xs font-bold">X</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
            "_blank"
          )
        }
        title="Share on Facebook"
      >
        <span className="text-xs font-bold">f</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
            "_blank"
          )
        }
        title="Share on LinkedIn"
      >
        <span className="text-xs font-bold">in</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        title="Copy link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
