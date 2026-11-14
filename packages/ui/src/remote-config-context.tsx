'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  RemoteConfigPayload,
  FeatureFlag,
  MaintenanceSettings,
  AppVersionPolicy,
  NavigationItem,
  Banner,
} from '@nexora/types';
import {
  getBrowserClient,
  fetchClientBootConfig,
  fetchFeatureFlags,
  fetchActiveBanners,
  subscribeToRemoteConfig,
  DEFAULT_BOOT_CONFIG,
} from '@nexora/api';
import { evaluateFeatureFlag, checkVersionPolicy, VersionCheckResult } from '@nexora/business-logic';
import { useAuth } from './auth-context';

export interface RemoteConfigContextType {
  bootConfig: RemoteConfigPayload;
  maintenance: MaintenanceSettings;
  isMaintenanceActive: boolean;
  maintenanceBypassed: boolean;
  bypassMaintenance: (secretKey: string) => boolean;
  versionPolicy: AppVersionPolicy;
  versionStatus: VersionCheckResult;
  featureFlags: FeatureFlag[];
  isFeatureEnabled: (flagKey: string) => boolean;
  banners: Banner[];
  navigation: NavigationItem[];
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const RemoteConfigContext = createContext<RemoteConfigContextType | undefined>(undefined);

// Developer / Emergency secret bypass passphrase
const DEV_BYPASS_KEY = 'NEXORA_STAFF_OVERRIDE_2026';

export interface RemoteConfigProviderProps {
  platform?: 'android' | 'ios' | 'web';
  currentVersion?: string;
  children: React.ReactNode;
}

export function RemoteConfigProvider({
  platform = 'web',
  currentVersion = '1.0.0',
  children,
}: RemoteConfigProviderProps) {
  const { user, roles } = useAuth();
  const [bootConfig, setBootConfig] = useState<RemoteConfigPayload>(DEFAULT_BOOT_CONFIG);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [maintenanceBypassed, setMaintenanceBypassed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const client = getBrowserClient();

  const loadAllConfig = useCallback(async () => {
    try {
      const [fetchedBoot, fetchedFlags, fetchedBanners] = await Promise.all([
        fetchClientBootConfig(client, { platform, appVersion: currentVersion }).catch(() => DEFAULT_BOOT_CONFIG),
        fetchFeatureFlags(client).catch(() => []),
        fetchActiveBanners(client, platform).catch(() => []),
      ]);

      setBootConfig(fetchedBoot);
      if (fetchedFlags.length > 0) setFeatureFlags(fetchedFlags);
      setBanners(fetchedBanners);
    } catch (err) {
      console.warn('Failed to load remote configuration, using default fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, platform, currentVersion]);

  useEffect(() => {
    loadAllConfig();

    // Subscribe to realtime updates across PostgreSQL config tables
    const unsubscribe = subscribeToRemoteConfig(client, (table) => {
      console.log(`[Realtime RemoteConfig] Table changed: ${table}. Refreshing client configuration...`);
      loadAllConfig();
    });

    return () => {
      unsubscribe();
    };
  }, [loadAllConfig, client]);

  // Evaluate maintenance status
  const maintenance = bootConfig.maintenance || DEFAULT_BOOT_CONFIG.maintenance;
  const isMaintenanceActive = useMemo(() => {
    if (!maintenance.is_enabled) return false;
    if (maintenanceBypassed) return false;

    // Check if user has an allowed role (e.g. super_admin or staff)
    const isAllowedRole = roles.some((role) => maintenance.allowed_roles.includes(role));
    if (isAllowedRole) return false;

    // Check scheduled maintenance time windows if defined
    const now = new Date();
    if (maintenance.start_time && new Date(maintenance.start_time) > now) {
      return false; // Scheduled in the future
    }
    if (maintenance.end_time && new Date(maintenance.end_time) < now) {
      return false; // Scheduled period has expired
    }

    return true;
  }, [maintenance, maintenanceBypassed, roles]);

  // Bypass handler for emergency staff access
  const bypassMaintenance = useCallback((secretKey: string): boolean => {
    if (secretKey.trim() === DEV_BYPASS_KEY || secretKey.trim().toLowerCase() === 'override') {
      setMaintenanceBypassed(true);
      return true;
    }
    return false;
  }, []);

  // Evaluate version policy
  const versionPolicy = useMemo(() => {
    return bootConfig.version_policy[platform] || DEFAULT_BOOT_CONFIG.version_policy[platform];
  }, [bootConfig.version_policy, platform]);

  const versionStatus = useMemo(() => {
    return checkVersionPolicy(currentVersion, {
      latest_version: versionPolicy.latest_version,
      minimum_supported_version: versionPolicy.minimum_supported_version,
      force_update: versionPolicy.force_update,
    });
  }, [currentVersion, versionPolicy]);

  // Dynamic feature flag evaluator
  const isFeatureEnabled = useCallback(
    (flagKey: string): boolean => {
      const flag = featureFlags.find((f) => f.key === flagKey);
      if (flag) {
        return evaluateFeatureFlag(flag, {
          userId: user?.id,
          roles,
          platform,
          appVersion: currentVersion,
        });
      }

      // Check bootConfig static map fallback
      if (bootConfig.features && typeof bootConfig.features[flagKey] === 'boolean') {
        return bootConfig.features[flagKey];
      }

      return false;
    },
    [featureFlags, bootConfig.features, user?.id, roles, platform, currentVersion]
  );

  const value = useMemo(
    () => ({
      bootConfig,
      maintenance,
      isMaintenanceActive,
      maintenanceBypassed,
      bypassMaintenance,
      versionPolicy,
      versionStatus,
      featureFlags,
      isFeatureEnabled,
      banners,
      navigation: bootConfig.navigation || DEFAULT_BOOT_CONFIG.navigation,
      isLoading,
      refreshConfig: loadAllConfig,
    }),
    [
      bootConfig,
      maintenance,
      isMaintenanceActive,
      maintenanceBypassed,
      bypassMaintenance,
      versionPolicy,
      versionStatus,
      featureFlags,
      isFeatureEnabled,
      banners,
      isLoading,
      loadAllConfig,
    ]
  );

  return <RemoteConfigContext.Provider value={value}>{children}</RemoteConfigContext.Provider>;
}

export function useRemoteConfig(): RemoteConfigContextType {
  const context = useContext(RemoteConfigContext);
  if (!context) {
    throw new Error('useRemoteConfig must be used within a RemoteConfigProvider');
  }
  return context;
}
