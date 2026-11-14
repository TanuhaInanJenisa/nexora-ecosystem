import type {
  RemoteConfigPayload,
  FeatureFlag,
  MaintenanceSettings,
  AppVersionPolicy,
  NavigationItem,
  Banner,
} from '@nexora/types';
import type { NexoraClient } from './client';

export interface ClientBootConfigParams {
  platform: 'android' | 'ios' | 'web';
  appVersion: string;
}

/**
 * Fallback boot configuration when offline or when database is unreachable.
 */
export const DEFAULT_BOOT_CONFIG: RemoteConfigPayload = {
  version: '1.0.0',
  maintenance: {
    is_enabled: false,
    title: 'NEXORA Ecosystem Maintenance',
    message: 'We are performing scheduled ecosystem upgrades. Services will resume shortly.',
    start_time: null,
    end_time: null,
    allowed_roles: ['super_admin', 'staff'],
    allowed_ips: [],
  },
  version_policy: {
    web: {
      platform: 'web',
      latest_version: '1.0.0',
      minimum_supported_version: '1.0.0',
      force_update: false,
      update_url: 'https://nexora.ecosystem',
    },
    android: {
      platform: 'android',
      latest_version: '1.0.0',
      minimum_supported_version: '1.0.0',
      force_update: false,
      update_url: 'https://play.google.com/store/apps/details?id=com.nexora.app',
    },
    ios: {
      platform: 'ios',
      latest_version: '1.0.0',
      minimum_supported_version: '1.0.0',
      force_update: false,
      update_url: 'https://apps.apple.com/app/nexora/id0000000000',
    },
  },
  features: {
    'ai-assistant': true,
    'biometric-auth': true,
    'push-notifications': true,
    'dark-mode-override': true,
    'community-chat': true,
  },
  branding: {
    app_name: 'NEXORA',
    tagline: 'One Ecosystem. Unlimited Possibilities.',
    logo_url: '/nexora-logo.svg',
    primary_color: '#4F46E5',
    accent_color: '#7C3AED',
  },
  navigation: [
    { id: '1', label: 'Home', route: '/', platform: 'all', order_index: 0, is_visible: true },
    { id: '2', label: 'Explore', route: '/services', platform: 'all', order_index: 1, is_visible: true },
    { id: '3', label: 'Community', route: '/community', platform: 'all', order_index: 2, is_visible: true },
  ],
  timestamp: new Date().toISOString(),
};

/**
 * Fetch unified client boot payload using Supabase RPC `get_client_boot_config`
 */
export async function fetchClientBootConfig(
  client: NexoraClient,
  params: ClientBootConfigParams
): Promise<RemoteConfigPayload> {
  try {
    const { data, error } = await (client as any).rpc('get_client_boot_config', {
      client_platform: params.platform,
      client_app_version: params.appVersion,
    });

    if (error || !data) {
      console.warn('RPC get_client_boot_config call returned error or empty, using fallback:', error?.message);
      return DEFAULT_BOOT_CONFIG;
    }

    const payload = data as Record<string, unknown>;

    return {
      version: params.appVersion,
      maintenance: (payload.maintenance as MaintenanceSettings) || DEFAULT_BOOT_CONFIG.maintenance,
      version_policy: {
        ...DEFAULT_BOOT_CONFIG.version_policy,
        [params.platform]: (payload.version_policy as AppVersionPolicy) || DEFAULT_BOOT_CONFIG.version_policy[params.platform],
      },
      features: (payload.features as Record<string, boolean>) || DEFAULT_BOOT_CONFIG.features,
      branding: DEFAULT_BOOT_CONFIG.branding,
      navigation: Array.isArray(payload.navigation)
        ? (payload.navigation as NavigationItem[])
        : DEFAULT_BOOT_CONFIG.navigation,
      timestamp: (payload.timestamp as string) || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to fetch client boot configuration:', err);
    return DEFAULT_BOOT_CONFIG;
  }
}

/**
 * Fetch active feature flags from PostgreSQL
 */
export async function fetchFeatureFlags(client: NexoraClient): Promise<FeatureFlag[]> {
  const { data, error } = await (client as any)
    .from('feature_flags')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Could not fetch feature flags, returning empty:', error.message);
    return [];
  }

  return (data as unknown as FeatureFlag[]) || [];
}

/**
 * Fetch active dynamic banners
 */
export async function fetchActiveBanners(
  client: NexoraClient,
  platform: 'android' | 'ios' | 'web' | 'all' = 'all'
): Promise<Banner[]> {
  let query = (client as any)
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (platform !== 'all') {
    query = query.or(`target_platform.eq.${platform},target_platform.eq.all`);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Could not fetch banners:', error.message);
    return [];
  }

  return (data as unknown as Banner[]) || [];
}

/**
 * Fetch current maintenance settings
 */
export async function fetchMaintenanceSettings(
  client: NexoraClient
): Promise<MaintenanceSettings | null> {
  const { data, error } = await (client as any)
    .from('maintenance_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_BOOT_CONFIG.maintenance;
  }

  return data as unknown as MaintenanceSettings;
}

/**
 * Fetch app version policy for a platform
 */
export async function fetchAppVersionPolicy(
  client: NexoraClient,
  platform: 'android' | 'ios' | 'web'
): Promise<AppVersionPolicy | null> {
  const { data, error } = await (client as any)
    .from('app_versions')
    .select('*')
    .eq('platform', platform)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_BOOT_CONFIG.version_policy[platform];
  }

  return data as unknown as AppVersionPolicy;
}

/**
 * Update maintenance settings (requires staff/super_admin clearance)
 */
export async function updateMaintenanceSettings(
  client: NexoraClient,
  updates: Partial<MaintenanceSettings>
): Promise<boolean> {
  const { error } = await (client as any)
    .from('maintenance_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all/singleton rows

  if (error) {
    console.error('Failed to update maintenance settings:', error.message);
    return false;
  }
  return true;
}

/**
 * Update a feature flag (requires staff/super_admin clearance)
 */
export async function updateFeatureFlag(
  client: NexoraClient,
  flagId: string,
  updates: Partial<FeatureFlag>
): Promise<boolean> {
  const { error } = await (client as any)
    .from('feature_flags')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', flagId);

  if (error) {
    console.error('Failed to update feature flag:', error.message);
    return false;
  }
  return true;
}

/**
 * Update app version policy (requires staff/super_admin clearance)
 */
export async function updateAppVersionPolicy(
  client: NexoraClient,
  platform: 'android' | 'ios' | 'web',
  updates: Partial<AppVersionPolicy>
): Promise<boolean> {
  const { error } = await (client as any)
    .from('app_versions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('platform', platform);

  if (error) {
    console.error('Failed to update app version policy:', error.message);
    return false;
  }
  return true;
}

/**
 * Subscribes to real-time changes across ecosystem configuration tables.
 * Emits whenever admin toggles maintenance, feature flags, or policies.
 */
export function subscribeToRemoteConfig(
  client: NexoraClient,
  onUpdate: (table: string) => void
): () => void {
  const channel = client
    .channel('nexora-remote-config-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'maintenance_settings' },
      () => onUpdate('maintenance_settings')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'feature_flags' },
      () => onUpdate('feature_flags')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_versions' },
      () => onUpdate('app_versions')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'banners' },
      () => onUpdate('banners')
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
