"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Dna,
  Droplets,
  Heart,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategoryConfig } from "@/lib/utils/categories";
import { SITE_NAME } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets,
  Heart,
  Dna,
  Activity,
};

function CategoryLink({ category }: { category: CategoryConfig }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(`/${category.slug}`);
  const Icon = ICON_MAP[category.icon] || Activity;

  return (
    <Link
      href={`/${category.slug}`}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? `${category.bgColor} ${category.color}`
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{category.name}</span>
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {Object.values(CATEGORIES).map((cat) => (
              <CategoryLink key={cat.slug} category={cat} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background p-4 space-y-1">
          {Object.values(CATEGORIES).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${cat.color} hover:bg-muted`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {(() => {
                const Icon = ICON_MAP[cat.icon] || Activity;
                return <Icon className="h-4 w-4" />;
              })()}
              {cat.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
