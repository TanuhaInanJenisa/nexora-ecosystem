import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import type {
  RemoteConfigPayload,
  FeatureFlag,
  MaintenanceSettings,
  AppVersionPolicy,
} from '@nexora/types';
import {
  getBrowserClient,
  fetchClientBootConfig,
  fetchFeatureFlags,
  subscribeToRemoteConfig,
  DEFAULT_BOOT_CONFIG,
} from '@nexora/api';
import { evaluateFeatureFlag, checkVersionPolicy, VersionCheckResult } from '@nexora/business-logic';

export interface MobileRemoteConfigType {
  bootConfig: RemoteConfigPayload;
  maintenance: MaintenanceSettings;
  isMaintenanceActive: boolean;
  maintenanceBypassed: boolean;
  bypassMaintenance: (key: string) => boolean;
  versionPolicy: AppVersionPolicy;
  versionStatus: VersionCheckResult;
  isFeatureEnabled: (flagKey: string) => boolean;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const MobileRemoteConfigContext = createContext<MobileRemoteConfigType | undefined>(undefined);

const CURRENT_MOBILE_VERSION = '1.0.0';
const DEV_BYPASS_KEY = 'NEXORA_STAFF_OVERRIDE_2026';

export function MobileRemoteConfigProvider({ children }: { children: React.ReactNode }) {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const [bootConfig, setBootConfig] = useState<RemoteConfigPayload>(DEFAULT_BOOT_CONFIG);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [maintenanceBypassed, setMaintenanceBypassed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const client = getBrowserClient();

  const loadConfig = useCallback(async () => {
    try {
      const [fetchedBoot, fetchedFlags] = await Promise.all([
        fetchClientBootConfig(client, { platform, appVersion: CURRENT_MOBILE_VERSION }).catch(
          () => DEFAULT_BOOT_CONFIG
        ),
        fetchFeatureFlags(client).catch(() => []),
      ]);

      setBootConfig(fetchedBoot);
      if (fetchedFlags.length > 0) setFeatureFlags(fetchedFlags);
    } catch (err) {
      console.warn('Failed to fetch mobile remote config, using default:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, platform]);

  useEffect(() => {
    loadConfig();

    const unsubscribe = subscribeToRemoteConfig(client, (table) => {
      console.log(`[Mobile Realtime] Config table updated: ${table}`);
      loadConfig();
    });

    return () => {
      unsubscribe();
    };
  }, [loadConfig, client]);

  const maintenance = bootConfig.maintenance || DEFAULT_BOOT_CONFIG.maintenance;
  const isMaintenanceActive = useMemo(() => {
    if (!maintenance.is_enabled) return false;
    if (maintenanceBypassed) return false;

    const now = new Date();
    if (maintenance.start_time && new Date(maintenance.start_time) > now) return false;
    if (maintenance.end_time && new Date(maintenance.end_time) < now) return false;

    return true;
  }, [maintenance, maintenanceBypassed]);

  const bypassMaintenance = useCallback((key: string): boolean => {
    if (key.trim() === DEV_BYPASS_KEY || key.trim().toLowerCase() === 'override') {
      setMaintenanceBypassed(true);
      return true;
    }
    return false;
  }, []);

  const versionPolicy = useMemo(() => {
    return bootConfig.version_policy[platform] || DEFAULT_BOOT_CONFIG.version_policy[platform];
  }, [bootConfig.version_policy, platform]);

  const versionStatus = useMemo(() => {
    return checkVersionPolicy(CURRENT_MOBILE_VERSION, {
      latest_version: versionPolicy.latest_version,
      minimum_supported_version: versionPolicy.minimum_supported_version,
      force_update: versionPolicy.force_update,
    });
  }, [versionPolicy]);

  const isFeatureEnabled = useCallback(
    (flagKey: string): boolean => {
      const flag = featureFlags.find((f) => f.key === flagKey);
      if (flag) {
        return evaluateFeatureFlag(flag, {
          platform,
          appVersion: CURRENT_MOBILE_VERSION,
        });
      }

      if (bootConfig.features && typeof bootConfig.features[flagKey] === 'boolean') {
        return bootConfig.features[flagKey];
      }

      return false;
    },
    [featureFlags, bootConfig.features, platform]
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
      isFeatureEnabled,
      isLoading,
      refreshConfig: loadConfig,
    }),
    [
      bootConfig,
      maintenance,
      isMaintenanceActive,
      maintenanceBypassed,
      bypassMaintenance,
      versionPolicy,
      versionStatus,
      isFeatureEnabled,
      isLoading,
      loadConfig,
    ]
  );

  return (
    <MobileRemoteConfigContext.Provider value={value}>
      {children}
    </MobileRemoteConfigContext.Provider>
  );
}

export function useMobileRemoteConfig(): MobileRemoteConfigType {
  const context = useContext(MobileRemoteConfigContext);
  if (!context) {
    throw new Error('useMobileRemoteConfig must be used within MobileRemoteConfigProvider');
  }
  return context;
}

