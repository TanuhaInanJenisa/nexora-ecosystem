export const APP_NAME = 'NEXORA';
export const APP_TAGLINE = 'One Ecosystem. Unlimited Possibilities.';

export const SUPPORTED_LOCALES = ['en', 'bn'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const PLATFORMS = ['android', 'ios', 'web'] as const;
export type PlatformType = (typeof PLATFORMS)[number];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COMMUNITY_MEDIA: 'community-media',
  SERVICE_ATTACHMENTS: 'service-attachments',
  SYSTEM_ASSETS: 'system-assets',
} as const;

export const REALTIME_CHANNELS = {
  APP_CONFIG: 'nexora:app_config',
  NOTIFICATIONS: (userId: string) => `nexora:notifications:${userId}`,
  COMMUNITY: 'nexora:community',
} as const;

