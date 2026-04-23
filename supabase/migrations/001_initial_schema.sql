-- ENUMS
CREATE TYPE article_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE category_slug AS ENUM ('diabetes', 'transplant', 'bone-marrow', 'general-health');
CREATE TYPE pipeline_status AS ENUM ('pending', 'fetching', 'analyzing', 'generating', 'fact_checking', 'completed', 'failed');
CREATE TYPE fact_check_status AS ENUM ('verified', 'uncertain', 'unverified', 'flagged');

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug category_slug UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AUTHORS
CREATE TABLE authors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SOURCE PAPERS
CREATE TABLE source_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pubmed_id TEXT UNIQUE,
  semantic_scholar_id TEXT UNIQUE,
  title TEXT NOT NULL,
  abstract TEXT,
  authors JSONB DEFAULT '[]',
  journal TEXT,
  published_date DATE,
  doi TEXT,
  url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  used_in_article BOOLEAN DEFAULT false
);

-- PIPELINE RUNS
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('cron', 'manual')),
  triggered_by UUID REFERENCES authors(id),
  category_id UUID REFERENCES categories(id),
  status pipeline_status DEFAULT 'pending',
  papers_fetched INT DEFAULT 0,
  articles_generated INT DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ARTICLES
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  featured_image_credit TEXT,
  category_id UUID REFERENCES categories(id) NOT NULL,
  author_id UUID REFERENCES authors(id),
  status article_status DEFAULT 'draft',
  fact_check_status fact_check_status DEFAULT 'unverified',
  fact_check_report JSONB,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time_minutes INT,
  view_count INT DEFAULT 0,
  pipeline_run_id UUID REFERENCES pipeline_runs(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ARTICLE CITATIONS
CREATE TABLE article_citations (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES source_papers(id) ON DELETE CASCADE,
  citation_number INT NOT NULL,
  context TEXT,
  PRIMARY KEY (article_id, paper_id)
);

-- COMMENTS
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SUBSCRIBERS
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  categories category_slug[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BOOKMARKS
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, visitor_id)
);

-- INDEXES
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_approved ON comments(is_approved);
CREATE INDEX idx_source_papers_pubmed ON source_papers(pubmed_id);
CREATE INDEX idx_source_papers_category ON source_papers(category_id);
CREATE INDEX idx_bookmarks_visitor ON bookmarks(visitor_id);
CREATE INDEX idx_subscribers_active ON subscribers(is_active);

-- FULL TEXT SEARCH
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- ROW LEVEL SECURITY
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public can view published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Authenticated users (admins) have full access to articles
CREATE POLICY "Admins have full access to articles"
  ON articles FOR ALL
  USING (auth.role() = 'authenticated');

-- Public can view approved comments
CREATE POLICY "Public can view approved comments"
  ON comments FOR SELECT
  USING (is_approved = true);

-- Public can insert comments
CREATE POLICY "Public can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
  ON comments FOR ALL
  USING (auth.role() = 'authenticated');

-- Public can manage their own bookmarks
CREATE POLICY "Public can manage bookmarks"
  ON bookmarks FOR ALL
  USING (true);

-- Public can subscribe
CREATE POLICY "Public can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- Public can view their own subscription
CREATE POLICY "Public can view own subscription"
  ON subscribers FOR SELECT
  USING (true);

-- Admins can manage subscribers
CREATE POLICY "Admins can manage subscribers"
  ON subscribers FOR ALL
  USING (auth.role() = 'authenticated');

-- SEED CATEGORIES
INSERT INTO categories (slug, name, description, color, icon, seo_title, seo_description) VALUES
  ('diabetes', 'Diabetes Research', 'Latest research on Type 1, Type 2 diabetes, prediabetes, blood sugar management, and insulin therapy.', '#2563eb', 'Droplets', 'Diabetes Research News | MedResearch Blog', 'Stay informed with the latest diabetes research, clinical trials, and treatment breakthroughs.'),
  ('transplant', 'Organ Transplant', 'Cutting-edge research on kidney, liver, lung, and heart transplants, donor matching, and rejection prevention.', '#dc2626', 'Heart', 'Organ Transplant News | MedResearch Blog', 'Latest organ transplant research, surgical advances, and transplant outcome studies.'),
  ('bone-marrow', 'Bone Marrow & Stem Cell', 'Research on bone marrow transplants, stem cell therapy, leukemia treatment, and hematopoietic advances.', '#9333ea', 'Dna', 'Bone Marrow & Stem Cell Research | MedResearch Blog', 'Latest bone marrow transplant and stem cell therapy research, clinical trials, and treatment news.'),
  ('general-health', 'General Health', 'Broader health research covering public health, preventive medicine, clinical guidelines, and wellness.', '#16a34a', 'Activity', 'General Health Research News | MedResearch Blog', 'Evidence-based general health news, public health research, and clinical guideline updates.');
