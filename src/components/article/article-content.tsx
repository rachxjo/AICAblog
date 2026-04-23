import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
