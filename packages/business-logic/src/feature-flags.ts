import type { FeatureFlag, UserRole } from '@nexora/types';
import { compareSemver } from './version';

/**
 * Deterministic hash of string into 0-99 bucket for consistent percentage rollouts.
 */
function hashToBucket(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash % 100);
}

export interface EvaluationContext {
  userId?: string;
  roles?: UserRole[];
  platform?: 'android' | 'ios' | 'web';
  appVersion?: string;
}

/**
 * Evaluates whether a feature flag should be enabled for a given context.
 */
export function evaluateFeatureFlag(flag: FeatureFlag, context: EvaluationContext = {}): boolean {
  if (!flag.is_enabled) {
    return false;
  }

  // Super admins always have access to test features
  if (context.roles?.includes('super_admin')) {
    return true;
  }

  // Check platform targeting
  if (context.platform && flag.target_platforms.length > 0) {
    if (!flag.target_platforms.includes(context.platform)) {
      return false;
    }
  }

  // Check minimum app version requirement
  if (flag.minimum_version && context.appVersion) {
    if (compareSemver(context.appVersion, flag.minimum_version) < 0) {
      return false;
    }
  }

  // Check role targeting if roles specified
  if (flag.target_roles.length > 0) {
    if (!context.roles || !context.roles.some((r) => flag.target_roles.includes(r))) {
      return false;
    }
  }

  // Check rollout percentage
  if (flag.rollout_percentage < 100) {
    if (flag.rollout_percentage <= 0) {
      return false;
    }
    const bucketKey = `${flag.key}:${context.userId || 'anonymous'}`;
    const bucket = hashToBucket(bucketKey);
    return bucket < flag.rollout_percentage;
  }

  return true;
}

