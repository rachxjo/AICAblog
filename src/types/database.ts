export type ArticleStatus = "draft" | "review" | "published" | "archived";
export type CategorySlug = "diabetes" | "transplant" | "bone-marrow" | "general-health";
export type PipelineStatus = "pending" | "fetching" | "analyzing" | "generating" | "fact_checking" | "completed" | "failed";
export type FactCheckStatus = "verified" | "uncertain" | "unverified" | "flagged";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  role: "admin" | "editor";
  created_at: string;
}

export interface SourcePaper {
  id: string;
  pubmed_id: string | null;
  semantic_scholar_id: string | null;
  title: string;
  abstract: string | null;
  authors: { name: string; affiliation?: string }[];
  journal: string | null;
  published_date: string | null;
  doi: string | null;
  url: string;
  category_id: string | null;
  fetched_at: string;
  used_in_article: boolean;
}

export interface FactCheckClaim {
  text: string;
  source_sentence: string;
  source_paper_id: string | null;
  status: FactCheckStatus;
  confidence: number;
  reason?: string;
}

export interface FactCheckReport {
  overall_status: FactCheckStatus;
  claims: FactCheckClaim[];
  warnings: string[];
  medical_disclaimer_required: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  featured_image_credit: string | null;
  category_id: string;
  author_id: string | null;
  status: ArticleStatus;
  fact_check_status: FactCheckStatus;
  fact_check_report: FactCheckReport | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
  reading_time_minutes: number | null;
  view_count: number;
  pipeline_run_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  author?: Author;
}

export interface ArticleCitation {
  article_id: string;
  paper_id: string;
  citation_number: number;
  context: string | null;
  paper?: SourcePaper;
}

export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  replies?: Comment[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  categories: CategorySlug[];
  is_active: boolean;
  confirmed_at: string | null;
  unsubscribe_token: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  article_id: string;
  visitor_id: string;
  created_at: string;
}

export interface PipelineRun {
  id: string;
  trigger_type: "cron" | "manual";
  triggered_by: string | null;
  category_id: string | null;
  status: PipelineStatus;
  papers_fetched: number;
  articles_generated: number;
  error_log: string | null;
  started_at: string;
  completed_at: string | null;
}
