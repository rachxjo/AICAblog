import { ExternalLink } from "lucide-react";

interface Citation {
  citation_number: number;
  context: string | null;
  paper: {
    title: string;
    url: string;
    journal: string | null;
    authors: { name: string }[];
    published_date: string | null;
  } | null;
}

export function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-bold font-heading mb-4">
        Source References
      </h2>
      <ol className="space-y-3 list-decimal list-inside">
        {citations.map((cit) => (
          <li key={cit.citation_number} className="text-sm">
            <a
              href={cit.paper?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {cit.paper?.title}
              <ExternalLink className="h-3 w-3" />
            </a>
            {cit.paper?.journal && (
              <span className="text-muted-foreground">
                {" "}
                — {cit.paper.journal}
              </span>
            )}
            {cit.paper?.authors && cit.paper.authors.length > 0 && (
              <span className="text-muted-foreground block ml-5">
                {cit.paper.authors
                  .slice(0, 3)
                  .map((a) => a.name)
                  .join(", ")}
                {cit.paper.authors.length > 3 && " et al."}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
