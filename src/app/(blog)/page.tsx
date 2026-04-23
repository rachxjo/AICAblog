import Link from "next/link";
import { Activity, ArrowRight, Dna, Droplets, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/utils/categories";
import { SITE_NAME } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets,
  Heart,
  Dna,
  Activity,
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl mb-4">
          {SITE_NAME}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-powered medical research news. We analyze the latest peer-reviewed
          studies and deliver clear, evidence-based health articles.
        </p>
      </section>

      {/* Category Sections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(CATEGORIES).map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Activity;
            return (
              <Link key={cat.slug} href={`/${cat.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className={`rounded-lg p-2 ${cat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${cat.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cat.description}
                    </p>
                    <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                      View articles <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold font-heading mb-2">
          Stay Updated
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Subscribe to get the latest medical research articles delivered to
          your inbox weekly.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
