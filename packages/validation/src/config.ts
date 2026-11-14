import { z } from 'zod';

export const featureFlagSchema = z.object({
  key: z.string().min(2).max(64).regex(/^[a-z0-9_.-]+$/, 'Key must be lowercase letters, numbers, dashes, underscores, or dots'),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  is_enabled: z.boolean(),
  rollout_percentage: z.number().int().min(0).max(100),
  target_roles: z.array(z.string()).default([]),
  target_platforms: z.array(z.enum(['android', 'ios', 'web'])).default(['android', 'ios', 'web']),
  minimum_version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const maintenanceSettingsSchema = z.object({
  is_enabled: z.boolean(),
  title: z.string().min(2).max(150),
  message: z.string().min(5).max(1000),
  start_time: z.string().datetime().nullable().optional(),
  end_time: z.string().datetime().nullable().optional(),
  allowed_roles: z.array(z.string()).default(['super_admin']),
  allowed_ips: z.array(z.string()).default([]),
});

export const appVersionPolicySchema = z.object({
  platform: z.enum(['android', 'ios', 'web']),
  latest_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  minimum_supported_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  force_update: z.boolean(),
  update_url: z.string().url(),
  release_notes: z.string().optional(),
});

export type FeatureFlagInput = z.infer<typeof featureFlagSchema>;
export type MaintenanceSettingsInput = z.infer<typeof maintenanceSettingsSchema>;
export type AppVersionPolicyInput = z.infer<typeof appVersionPolicySchema>;

