-- ==============================================================================
-- NEXORA PLATFORM PRODUCTION SEED SCRIPT
-- Purpose: Seed default Roles, Permissions, App Configs, Features, and Navigation
-- ==============================================================================

-- 1. SEED SYSTEM ROLES
INSERT INTO public.roles (name, display_name, description) VALUES
  ('super_admin', 'Super Administrator', 'Full unrestricted platform access, security administration and overrides'),
  ('system_admin', 'System Administrator', 'Infrastructure, system health, settings and audit administration'),
  ('manager', 'Operations Manager', 'Service management, staff dispatch, and community governance'),
  ('moderator', 'Community Moderator', 'Content screening, comment review, and abuse report triage'),
  ('support_agent', 'Customer Support', 'User ticketing, help center assistance, and customer relations'),
  ('finance_admin', 'Finance Administrator', 'Billing, invoices, payout verification, and refund management'),
  ('analyst', 'System Analyst', 'Read-only analytics, metric reporting, and audit logs'),
  ('user', 'Standard User', 'Standard ecosystem client access across Web and Mobile')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- 2. SEED SYSTEM PERMISSIONS
INSERT INTO public.permissions (code, description, module) VALUES
  ('user.read', 'View user profiles, devices, and sessions', 'users'),
  ('user.write', 'Create new internal user profiles', 'users'),
  ('user.update', 'Update user profiles and roles', 'users'),
  ('user.suspend', 'Suspend or ban malicious accounts', 'users'),
  ('user.delete', 'Permanently purge user records', 'users'),
  ('admin.manage', 'Assign privileged roles and configure RBAC', 'admin'),
  ('app.config.read', 'Read non-public app configurations', 'config'),
  ('app.config.update', 'Modify system settings, versions, and themes', 'config'),
  ('feature.read', 'View feature flag definitions and metrics', 'feature_flags'),
  ('feature.manage', 'Create, update, toggle and override feature flags', 'feature_flags'),
  ('payment.read', 'View financial transactions, invoices, and plans', 'payments'),
  ('payment.refund', 'Authorize and process customer refunds', 'payments'),
  ('payment.manage', 'Create coupons, edit subscription plans and gateways', 'payments'),
  ('content.read', 'View draft and internal CMS content', 'content'),
  ('content.create', 'Draft new articles, banners, and FAQs', 'content'),
  ('content.publish', 'Publish or unpublish CMS pages and banners', 'content'),
  ('content.delete', 'Delete content from CMS archives', 'content'),
  ('community.moderate', 'Lock, pin, hide posts and triage reports', 'community'),
  ('audit.read', 'Inspect immutable audit logs and security events', 'security'),
  ('service.manage', 'Create, update, and schedule ecosystem services', 'services'),
  ('ai.manage', 'Configure AI models, quotas, and prompts', 'ai'),
  ('notification.send', 'Broadcast notifications and targeted campaigns', 'notifications')
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  module = EXCLUDED.module;

-- 3. LINK ROLES TO PERMISSIONS
DO $$
DECLARE
  r_super_admin UUID;
  r_system_admin UUID;
  r_manager UUID;
  r_moderator UUID;
  r_support_agent UUID;
  r_finance_admin UUID;
  r_analyst UUID;
  r_user UUID;
BEGIN
  SELECT id INTO r_super_admin FROM public.roles WHERE name = 'super_admin';
  SELECT id INTO r_system_admin FROM public.roles WHERE name = 'system_admin';
  SELECT id INTO r_manager FROM public.roles WHERE name = 'manager';
  SELECT id INTO r_moderator FROM public.roles WHERE name = 'moderator';
  SELECT id INTO r_support_agent FROM public.roles WHERE name = 'support_agent';
  SELECT id INTO r_finance_admin FROM public.roles WHERE name = 'finance_admin';
  SELECT id INTO r_analyst FROM public.roles WHERE name = 'analyst';
  SELECT id INTO r_user FROM public.roles WHERE name = 'user';

  -- Super Admin: ALL PERMISSIONS
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_super_admin, id FROM public.permissions
  ON CONFLICT DO NOTHING;

  -- System Admin
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_system_admin, id FROM public.permissions
  WHERE code IN ('user.read', 'user.write', 'user.update', 'user.suspend', 'app.config.read', 'app.config.update', 'feature.read', 'feature.manage', 'audit.read', 'content.read', 'content.publish', 'community.moderate', 'notification.send')
  ON CONFLICT DO NOTHING;

  -- Manager
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_manager, id FROM public.permissions
  WHERE code IN ('user.read', 'content.read', 'content.create', 'content.publish', 'service.manage', 'community.moderate', 'notification.send')
  ON CONFLICT DO NOTHING;

  -- Moderator
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_moderator, id FROM public.permissions
  WHERE code IN ('user.read', 'content.read', 'community.moderate')
  ON CONFLICT DO NOTHING;

  -- Support Agent
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_support_agent, id FROM public.permissions
  WHERE code IN ('user.read', 'content.read')
  ON CONFLICT DO NOTHING;

  -- Finance Admin
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_finance_admin, id FROM public.permissions
  WHERE code IN ('payment.read', 'payment.refund', 'payment.manage', 'audit.read')
  ON CONFLICT DO NOTHING;

  -- Analyst
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_analyst, id FROM public.permissions
  WHERE code IN ('audit.read', 'content.read')
  ON CONFLICT DO NOTHING;

  -- User
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT r_user, id FROM public.permissions
  WHERE code IN ('content.read')
  ON CONFLICT DO NOTHING;
END $$;

-- 4. SEED DEFAULT APP SETTINGS
INSERT INTO public.app_settings (key, value, category, description, is_public) VALUES
  ('branding', '{"app_name": "NEXORA", "tagline": "One Ecosystem. Unlimited Possibilities.", "primary_color": "#4F46E5", "accent_color": "#7C3AED", "cyan_accent": "#06B6D4"}'::jsonb, 'branding', 'System visual identity & branding tokens', TRUE),
  ('contact', '{"support_email": "support@nexora.com", "phone": "+1-800-NEXORA", "address": "Global Digital Headquarters"}'::jsonb, 'general', 'Company support contact information', TRUE),
  ('security_policy', '{"max_login_attempts": 5, "lockout_minutes": 15, "require_mfa_admin": true}'::jsonb, 'security', 'System security and rate-limiting thresholds', FALSE)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  is_public = EXCLUDED.is_public;

-- 5. SEED INITIAL FEATURE FLAGS
INSERT INTO public.feature_flags (key, name, description, is_enabled, rollout_percentage, target_roles, target_platforms) VALUES
  ('community_feed', 'Community Discussions Feed', 'Enable the public community feed and commentary threads', TRUE, 100, '{}'::text[], ARRAY['android', 'ios', 'web']::text[]),
  ('ai_assistant', 'NEXORA AI Smart Assistant', 'Enable integrated AI chat assistant across platforms', TRUE, 100, '{}'::text[], ARRAY['android', 'ios', 'web']::text[]),
  ('service_booking', 'Service Catalog & Bookings', 'Enable on-demand service exploration and order placement', TRUE, 100, '{}'::text[], ARRAY['android', 'ios', 'web']::text[]),
  ('push_notifications', 'Mobile & Web Push Notifications', 'Live push dispatch and notification center', TRUE, 100, '{}'::text[], ARRAY['android', 'ios', 'web']::text[]),
  ('dark_mode', 'Dark Navy Theme', 'Enable user-switchable dark mode', TRUE, 100, '{}'::text[], ARRAY['android', 'ios', 'web']::text[]),
  ('beta_ai_summaries', 'Experimental AI Summaries', 'Automated document and thread summarization in beta testing', FALSE, 25, ARRAY['super_admin', 'system_admin', 'manager']::text[], ARRAY['web']::text[])
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  is_enabled = EXCLUDED.is_enabled,
  rollout_percentage = EXCLUDED.rollout_percentage;

-- 6. SEED APP VERSIONS POLICY
INSERT INTO public.app_versions (platform, latest_version, minimum_supported_version, force_update, update_url, release_notes) VALUES
  ('android', '1.0.0', '1.0.0', FALSE, 'https://play.google.com/store/apps/details?id=com.nexora.app', 'Initial NEXORA 1.0 release with complete digital ecosystem support.'),
  ('ios', '1.0.0', '1.0.0', FALSE, 'https://apps.apple.com/app/nexora/id123456789', 'Initial NEXORA 1.0 release for iOS.'),
  ('web', '1.0.0', '1.0.0', FALSE, 'https://nexora.com', 'Initial NEXORA Web release.')
ON CONFLICT (platform) DO UPDATE SET
  latest_version = EXCLUDED.latest_version,
  minimum_supported_version = EXCLUDED.minimum_supported_version;

-- 7. SEED MAINTENANCE SETTINGS
INSERT INTO public.maintenance_settings (id, is_enabled, title, message, allowed_roles)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  FALSE,
  'NEXORA Ecosystem Maintenance',
  'We are currently applying scheduled platform enhancements. All services will be back online shortly.',
  ARRAY['super_admin']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED DYNAMIC NAVIGATION ITEMS
INSERT INTO public.navigation_items (label, icon, route, platform, order_index, is_visible) VALUES
  ('Home', 'Home', '/', 'all', 1, TRUE),
  ('Explore Services', 'Compass', '/services', 'all', 2, TRUE),
  ('Community', 'MessageSquare', '/community', 'all', 3, TRUE),
  ('Notifications', 'Bell', '/notifications', 'all', 4, TRUE),
  ('User Profile', 'User', '/profile', 'all', 5, TRUE),
  ('Super Admin', 'Shield', '/admin', 'web', 6, TRUE);

-- 9. SEED SERVICE CATEGORIES
INSERT INTO public.categories (name, slug, icon, description, is_active, order_index) VALUES
  ('Technology & Cloud', 'technology-cloud', 'Cpu', 'Cloud computing, system architecture, and API integration', TRUE, 1),
  ('Design & Creative', 'design-creative', 'Palette', 'UI/UX interface design, branding, and digital assets', TRUE, 2),
  ('Business Consulting', 'business-consulting', 'Briefcase', 'Enterprise strategy, digital transformation, and automation', TRUE, 3),
  ('Security & Compliance', 'security-compliance', 'ShieldCheck', 'Penetration testing, RBAC audit, and vulnerability analysis', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- 10. SEED SUBSCRIPTION PLANS
INSERT INTO public.subscription_plans (name, code, description, price_monthly, price_yearly, currency, features, max_requests, is_active) VALUES
  ('Starter', 'starter', 'Essential access for individual users and exploration', 0.00, 0.00, 'USD', '["Access to public community", "Browse all ecosystem services", "Up to 5 monthly requests", "Community support"]'::jsonb, 5, TRUE),
  ('Professional', 'pro', 'For power users, solo founders, and growing teams', 29.00, 290.00, 'USD', '["Everything in Starter", "Unlimited service requests", "Priority AI Assistant access", "Dedicated email support", "Custom theme accents"]'::jsonb, 100, TRUE),
  ('Enterprise', 'enterprise', 'Full ecosystem control, custom integrations and SLA', 99.00, 990.00, 'USD', '["Everything in Pro", "Dedicated Account Manager", "Custom Edge Function hooks", "24/7 Phone & Ticket SLA", "Audit trail access"]'::jsonb, 10000, TRUE)
ON CONFLICT (code) DO NOTHING;
