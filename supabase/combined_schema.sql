-- ==============================================================================
-- NEXORA DATABASE MIGRATION 01: Core Extensions & Security Functions
-- Description: Essential PostgreSQL extensions, timestamps trigger, and RBAC helpers
-- ==============================================================================

-- Enable UUID & crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automated updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if current authenticated user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = check_user_id AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if a user possesses a specific permission code
CREATE OR REPLACE FUNCTION public.has_permission(
  check_user_id UUID,
  required_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super admin bypasses all permission checks
  IF public.is_super_admin(check_user_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = check_user_id
      AND p.code = required_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper for current session's user
CREATE OR REPLACE FUNCTION public.current_user_has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_permission(auth.uid(), required_permission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- NEXORA DATABASE MIGRATION 02: Identity & Role-Based Access Control (RBAC)
-- Description: Core tables, profile trigger on signup, and strict RLS policies
-- ==============================================================================

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROLE-PERMISSIONS MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- 4. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone_number TEXT,
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'bn')),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. USER-ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

-- 6. USER-DEVICES TABLE (Mobile & Web Push Tokens)
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_token)
);

-- 7. USER-SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_id TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USER-PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'bn')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- AUTOMATIC SIGNUP PROVISIONING TRIGGER
-- Automatically creates Profile, User Preferences, and assigns 'user' role
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- 1. Insert Profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, locale, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'system')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert Default Preferences
  INSERT INTO public.user_preferences (user_id, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Assign Default 'user' Role
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'user' LIMIT 1;
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, default_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all identity tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. ROLES & PERMISSIONS POLICIES
CREATE POLICY "Authenticated users can read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('admin.manage'));

CREATE POLICY "Authenticated users can read permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permissions"
  ON public.permissions FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('admin.manage'));

CREATE POLICY "Authenticated users can read role_permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role_permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('admin.manage'));

-- 2. PROFILES POLICIES
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff with user.read can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.current_user_has_permission('user.read'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Regular users cannot un-suspend or verify themselves
    AND is_suspended = (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
    AND is_verified = (SELECT is_verified FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.current_user_has_permission('user.update'));

-- 3. USER ROLES POLICIES
CREATE POLICY "Users can read their own role assignments"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins with user.read can view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.current_user_has_permission('user.read'));

CREATE POLICY "Admins with admin.manage can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('admin.manage'));

-- 4. USER DEVICES POLICIES
CREATE POLICY "Users manage their own devices"
  ON public.user_devices FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff with user.read can inspect devices"
  ON public.user_devices FOR SELECT
  TO authenticated
  USING (public.current_user_has_permission('user.read'));

-- 5. USER SESSIONS POLICIES
CREATE POLICY "Users manage their own sessions"
  ON public.user_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. USER PREFERENCES POLICIES
CREATE POLICY "Users manage their own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- NEXORA DATABASE MIGRATION 03: Dynamic Application Control & Remote Config
-- Description: Feature flags, app versioning, maintenance mode, and navigation
-- ==============================================================================

-- 1. APP SETTINGS (Global configuration KV)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL CHECK (category IN ('general', 'branding', 'security', 'payment', 'ai', 'notification')),
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. FEATURE FLAGS (Rollouts, Targeting, Gating)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  target_roles TEXT[] NOT NULL DEFAULT '{}'::text[],
  target_platforms TEXT[] NOT NULL DEFAULT ARRAY['android', 'ios', 'web']::text[],
  minimum_version TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. FEATURE OVERRIDES (Specific user testing overrides)
CREATE TABLE IF NOT EXISTS public.feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feature_flag_id, user_id)
);

-- 4. APP VERSIONS POLICY
CREATE TABLE IF NOT EXISTS public.app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT UNIQUE NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  latest_version TEXT NOT NULL,
  minimum_supported_version TEXT NOT NULL,
  force_update BOOLEAN NOT NULL DEFAULT FALSE,
  update_url TEXT NOT NULL DEFAULT '',
  release_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_app_versions_updated_at
  BEFORE UPDATE ON public.app_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. MAINTENANCE SETTINGS
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT NOT NULL DEFAULT 'System Maintenance in Progress',
  message TEXT NOT NULL DEFAULT 'We are upgrading our services. Please check back shortly.',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  allowed_roles TEXT[] NOT NULL DEFAULT ARRAY['super_admin']::text[],
  allowed_ips TEXT[] NOT NULL DEFAULT '{}'::text[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DYNAMIC NAVIGATION ITEMS
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  icon TEXT,
  route TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('mobile', 'web', 'all')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  required_feature_flag TEXT,
  required_permission TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. THEME SETTINGS
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  light_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  dark_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- BOOT CONFIG RPC
-- Single roundtrip payload for mobile & web client initialization
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_client_boot_config(
  client_platform TEXT DEFAULT 'web',
  client_app_version TEXT DEFAULT '1.0.0'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'maintenance', (SELECT row_to_json(m) FROM public.maintenance_settings m LIMIT 1),
    'version_policy', (SELECT row_to_json(v) FROM public.app_versions v WHERE v.platform = client_platform LIMIT 1),
    'public_settings', (SELECT jsonb_object_agg(key, value) FROM public.app_settings WHERE is_public = TRUE),
    'navigation', (SELECT jsonb_agg(row_to_json(n)) FROM public.navigation_items n WHERE n.is_visible = TRUE AND (n.platform = client_platform OR n.platform = 'all')),
    'active_theme', (SELECT row_to_json(t) FROM public.theme_settings t WHERE t.is_active = TRUE LIMIT 1),
    'timestamp', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- RLS POLICIES FOR CONFIGURATION TABLES
-- ==============================================================================
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Public reads for client boot & public data
CREATE POLICY "Public settings readable by everyone"
  ON public.app_settings FOR SELECT
  USING (is_public = TRUE OR public.current_user_has_permission('app.config.read'));

CREATE POLICY "Feature flags readable by authenticated users"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view app versions"
  ON public.app_versions FOR SELECT
  USING (true);

CREATE POLICY "Public can view maintenance status"
  ON public.maintenance_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can view visible navigation items"
  ON public.navigation_items FOR SELECT
  USING (is_visible = TRUE OR public.current_user_has_permission('app.config.read'));

CREATE POLICY "Public can view active theme"
  ON public.theme_settings FOR SELECT
  USING (true);

-- Modifications strictly restricted to authorized staff/super_admin
CREATE POLICY "Admins manage app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

CREATE POLICY "Admins manage feature_flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('feature.manage'));

CREATE POLICY "Admins manage feature_overrides"
  ON public.feature_overrides FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('feature.manage'));

CREATE POLICY "Admins manage app_versions"
  ON public.app_versions FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

CREATE POLICY "Admins manage maintenance_settings"
  ON public.maintenance_settings FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

CREATE POLICY "Admins manage navigation_items"
  ON public.navigation_items FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

CREATE POLICY "Admins manage theme_settings"
  ON public.theme_settings FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

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

-- ==============================================================================
-- NEXORA DATABASE MIGRATION 05: Community, Social & Moderation
-- Description: Posts, nested comments, reactions, groups, follows, and reports
-- ==============================================================================

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. POST REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'love', 'celebrate', 'insightful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- 4. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- 5. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- 7. MODERATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'misinformation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- AUTOMATED COUNTER TRIGGERS
-- ==============================================================================
-- Increment / Decrement comments count
CREATE OR REPLACE FUNCTION public.sync_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_post_comments_count();

-- Increment / Decrement post likes count
CREATE OR REPLACE FUNCTION public.sync_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_post_likes_count();

-- ==============================================================================
-- RLS POLICIES FOR COMMUNITY
-- ==============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Posts
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (status = 'published' OR public.current_user_has_permission('community.moderate') OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or moderators can update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.current_user_has_permission('community.moderate'));

CREATE POLICY "Authors or moderators can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.current_user_has_permission('community.moderate'));

-- Comments
CREATE POLICY "Public can view non-hidden comments"
  ON public.comments FOR SELECT
  USING (is_hidden = FALSE OR public.current_user_has_permission('community.moderate') OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can post comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or moderators can update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.current_user_has_permission('community.moderate'));

CREATE POLICY "Authors or moderators can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.current_user_has_permission('community.moderate'));

-- Reactions
CREATE POLICY "Public can view reactions"
  ON public.post_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users manage their reactions"
  ON public.post_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Follows
CREATE POLICY "Public can view follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users manage their follows"
  ON public.follows FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Groups
CREATE POLICY "Public can view public groups"
  ON public.groups FOR SELECT
  USING (is_private = FALSE OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = public.groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Group Members
CREATE POLICY "Group members visible to group"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Moderation Reports
CREATE POLICY "Staff triage reports"
  ON public.reports FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('community.moderate'));

CREATE POLICY "Users create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- ==============================================================================
-- NEXORA DATABASE MIGRATION 06: Business, Commerce & Subscriptions
-- Description: Services, requests, organizations, plans, payments, and invoices
-- ==============================================================================

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

-- 3. SERVICES CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_minutes INTEGER,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SERVICE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. TASKS TABLE (Workflow tracking for requests)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  price_yearly NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_requests INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. PAYMENTS TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'bkash', 'sslcommerz', 'manual')),
  provider_tx_id TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. PAYMENT AUDIT EVENTS
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC(12, 2) NOT NULL,
  max_uses INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'paid', 'unpaid', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES FOR COMMERCE & BUSINESS
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Services & Plans: Public read
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_available = TRUE OR public.current_user_has_permission('service.manage'));

CREATE POLICY "Public can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = TRUE OR public.current_user_has_permission('payment.read'));

-- Service requests: Owner and staff
CREATE POLICY "Users view own service requests"
  ON public.service_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('service.manage') OR auth.uid() = assigned_staff_id);

CREATE POLICY "Users create service requests"
  ON public.service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and staff update service requests"
  ON public.service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('service.manage'));

-- Subscriptions: Owner and admin
CREATE POLICY "Users view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('payment.read'));

-- Payments: Owner and finance admin
CREATE POLICY "Users view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('payment.read'));

-- Invoices: Owner and finance admin
CREATE POLICY "Users view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('payment.read'));

-- Admin management permissions
CREATE POLICY "Staff manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('service.manage'));

CREATE POLICY "Finance staff manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('payment.manage'));

CREATE POLICY "Finance staff manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('payment.manage'));

CREATE POLICY "Users can validate active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ==============================================================================
-- NEXORA DATABASE MIGRATION 07: Communication, Support, Security & Audit Logs
-- Description: Notifications, support tickets, immutable audit trail, automation
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app']::text[],
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  deep_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. NOTIFICATION TEMPLATES
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL,
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NOTIFICATION CAMPAIGNS (Broadcasts & Marketing)
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'verified_only', 'role_based', 'custom_segment')),
  target_roles TEXT[] NOT NULL DEFAULT '{}'::text[],
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_delivered INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. TICKET MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE (STRICTLY IMMUTABLE APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. LOGIN EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SECURITY ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SYSTEM ERRORS TABLE
CREATE TABLE IF NOT EXISTS public.system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUTOMATION RULES & RUNS
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  execution_time_ms INTEGER,
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- SECURE AUDIT LOGGING HELPER RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- RLS POLICIES FOR NOTIFICATIONS, SUPPORT & AUDIT
-- ==============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Notifications: user sees own
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update read status of own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Support Tickets
CREATE POLICY "Users view own support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_has_permission('user.read') OR auth.uid() = assigned_agent_id);

CREATE POLICY "Users create support tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view ticket messages"
  ON public.ticket_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets st WHERE st.id = public.ticket_messages.ticket_id
    AND (st.user_id = auth.uid() OR public.current_user_has_permission('user.read') OR st.assigned_agent_id = auth.uid())
  ));

CREATE POLICY "Users and agents send ticket messages"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Feedback
CREATE POLICY "Users submit feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- AUDIT LOGS: IMMUTABLE!
CREATE POLICY "Auditors view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.current_user_has_permission('audit.read'));

-- Security alerts
CREATE POLICY "Staff view security alerts"
  ON public.security_alerts FOR SELECT
  TO authenticated
  USING (public.current_user_has_permission('admin.manage'));

-- Automation rules
CREATE POLICY "Staff manage automation"
  ON public.automation_rules FOR ALL
  TO authenticated
  USING (public.current_user_has_permission('app.config.update'));

