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

