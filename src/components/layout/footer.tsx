import Link from "next/link";
import { Activity } from "lucide-react";
import { CATEGORIES } from "@/lib/utils/categories";
import { SITE_NAME, MEDICAL_DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Medical Disclaimer */}
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Medical Disclaimer:</strong> {MEDICAL_DISCLAIMER}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-bold">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered medical research news, delivering the latest health
              research findings in clear, accessible articles.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 font-semibold text-sm">Categories</h3>
            <ul className="space-y-2">
              {Object.values(CATEGORIES).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 font-semibold text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Search Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-3 font-semibold text-sm">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get the latest research articles delivered to your inbox.
            </p>
            <Link
              href="/#newsletter"
              className="text-sm font-medium text-primary hover:underline"
            >
              Subscribe to our newsletter
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Articles generated
            from peer-reviewed research using AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
