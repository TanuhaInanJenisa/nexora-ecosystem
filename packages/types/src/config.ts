export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number; // 0 to 100
  target_roles: string[];
  target_platforms: ('android' | 'ios' | 'web')[];
  minimum_version?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: unknown;
  category: 'general' | 'branding' | 'security' | 'payment' | 'ai' | 'notification';
  description?: string;
  is_public: boolean;
  updated_by?: string;
  updated_at: string;
}

export interface MaintenanceSettings {
  is_enabled: boolean;
  title: string;
  message: string;
  start_time?: string | null;
  end_time?: string | null;
  allowed_roles: string[];
  allowed_ips: string[];
}

export interface AppVersionPolicy {
  platform: 'android' | 'ios' | 'web';
  latest_version: string;
  minimum_supported_version: string;
  force_update: boolean;
  update_url: string;
  release_notes?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
  platform: 'mobile' | 'web' | 'all';
  order_index: number;
  is_visible: boolean;
  required_feature_flag?: string;
  required_permission?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  target_url?: string | null;
  target_platform: 'mobile' | 'web' | 'all';
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  order_index: number;
  created_at: string;
}

export interface RemoteConfigPayload {
  version: string;
  maintenance: MaintenanceSettings;
  version_policy: Record<'android' | 'ios' | 'web', AppVersionPolicy>;
  features: Record<string, boolean>;
  branding: {
    app_name: string;
    tagline: string;
    logo_url: string;
    primary_color: string;
    accent_color: string;
  };
  navigation: NavigationItem[];
  timestamp: string;
}

