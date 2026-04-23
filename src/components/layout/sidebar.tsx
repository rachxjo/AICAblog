import Link from "next/link";
import { CATEGORIES } from "@/lib/utils/categories";
import { NewsletterForm } from "@/components/engagement/newsletter-form";

export function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* Newsletter Signup */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-2">Newsletter</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get the latest research articles delivered weekly.
        </p>
        <NewsletterForm />
      </div>

      {/* Categories */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="space-y-2">
          {Object.values(CATEGORIES).map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/${cat.slug}`}
                className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
