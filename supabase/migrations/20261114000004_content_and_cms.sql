-- ==============================================================================
-- NEXORA DATABASE MIGRATION 04: Content Management System (CMS) & Media
-- Description: Banners, dynamic pages, blog, categories, media, and FAQs
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BANNERS TABLE (Mobile & Web dynamic carousel/promos)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT,
  target_platform TEXT NOT NULL CHECK (target_platform IN ('mobile', 'web', 'all')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DYNAMIC PAGES TABLE (Legal, Privacy, About, etc.)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. MEDIA FILES TABLE (Storage file catalog)
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES FOR CMS TABLES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE OR public.current_user_has_permission('content.read'));

CREATE POLICY "Public can view active banners"
  ON public.banners FOR SELECT
  USING (
    is_active = TRUE 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
    OR public.current_user_has_permission('content.read')
  );

CREATE POLICY "Public can view published pages"
  ON public.pages FOR SELECT
  USING (is_published = TRUE OR public.current_user_has_permission('content.read'));

CREATE POLICY "Public can view media files"
  ON public.media_files FOR SELECT
  USING (true);

CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = TRUE OR public.current_user_has_permission('content.read'));

CREATE POLICY "Public can view active faqs"
  ON public.faqs FOR SELECT
  USING (is_active = TRUE OR public.current_user_has_permission('content.read'));

CREATE POLICY "Public can view active menu items"
  ON public.menu_items FOR SELECT
  USING (is_active = TRUE OR public.current_user_has_permission('content.read'));

-- Content creators & admins manage CMS
CREATE POLICY "Staff manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.publish'));

CREATE POLICY "Staff manage banners"
  ON public.banners FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.publish'));

CREATE POLICY "Staff manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.publish'));

CREATE POLICY "Authenticated users upload media files"
  ON public.media_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Staff manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.create'));

CREATE POLICY "Staff manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.publish'));

CREATE POLICY "Staff manage menu items"
  ON public.menu_items FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('content.publish'));

