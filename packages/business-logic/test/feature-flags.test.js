import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFeatureFlag } from '../dist/feature-flags.js';

describe('Feature Flags Evaluation Engine', () => {
  const baseFlag = {
    key: 'dark_mode_v2',
    name: 'Dark Mode V2',
    description: 'Upgraded dark theme styling',
    is_enabled: true,
    rollout_percentage: 100,
    target_roles: [],
    target_platforms: ['android', 'ios', 'web'],
    metadata: {},
  };

  it('should return false if feature flag is globally disabled', () => {
    const disabledFlag = { ...baseFlag, is_enabled: false };
    assert.equal(evaluateFeatureFlag(disabledFlag, {}), false);
    assert.equal(evaluateFeatureFlag(disabledFlag, { userId: 'usr_123' }), false);
  });

  it('super_admin should always have access to enabled flags regardless of targeting or rollout', () => {
    const restrictiveFlag = {
      ...baseFlag,
      rollout_percentage: 0,
      target_platforms: ['ios'],
      target_roles: ['finance_admin'],
      minimum_version: '99.0.0',
    };

    assert.equal(
      evaluateFeatureFlag(restrictiveFlag, {
        roles: ['super_admin'],
        platform: 'web',
        appVersion: '1.0.0',
      }),
      true
    );
  });

  it('should enforce platform targeting correctly', () => {
    const mobileOnlyFlag = {
      ...baseFlag,
      target_platforms: ['android', 'ios'],
    };

    assert.equal(evaluateFeatureFlag(mobileOnlyFlag, { platform: 'android' }), true);
    assert.equal(evaluateFeatureFlag(mobileOnlyFlag, { platform: 'ios' }), true);
    assert.equal(evaluateFeatureFlag(mobileOnlyFlag, { platform: 'web' }), false);
  });

  it('should enforce minimum app version requirements', () => {
    const versionedFlag = {
      ...baseFlag,
      minimum_version: '2.5.0',
    };

    assert.equal(evaluateFeatureFlag(versionedFlag, { appVersion: '2.4.9' }), false);
    assert.equal(evaluateFeatureFlag(versionedFlag, { appVersion: '2.5.0' }), true);
    assert.equal(evaluateFeatureFlag(versionedFlag, { appVersion: '3.0.0' }), true);
  });

  it('should enforce target roles restriction', () => {
    const managerFlag = {
      ...baseFlag,
      target_roles: ['manager', 'system_admin'],
    };

    assert.equal(evaluateFeatureFlag(managerFlag, { roles: ['user'] }), false);
    assert.equal(evaluateFeatureFlag(managerFlag, { roles: ['moderator'] }), false);
    assert.equal(evaluateFeatureFlag(managerFlag, { roles: ['manager'] }), true);
    assert.equal(evaluateFeatureFlag(managerFlag, { roles: ['user', 'system_admin'] }), true);
  });

  it('should evaluate rollout percentage deterministically using hash bucketing', () => {
    const zeroRolloutFlag = { ...baseFlag, rollout_percentage: 0 };
    assert.equal(evaluateFeatureFlag(zeroRolloutFlag, { userId: 'usr_alpha' }), false);

    const hundredRolloutFlag = { ...baseFlag, rollout_percentage: 100 };
    assert.equal(evaluateFeatureFlag(hundredRolloutFlag, { userId: 'usr_alpha' }), true);

    const fiftyRolloutFlag = { ...baseFlag, rollout_percentage: 50 };
    // Running multiple times for same userId must return identical deterministic result
    const run1 = evaluateFeatureFlag(fiftyRolloutFlag, { userId: 'usr_deterministic_99' });
    const run2 = evaluateFeatureFlag(fiftyRolloutFlag, { userId: 'usr_deterministic_99' });
    assert.equal(run1, run2);
  });
});
