import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compareSemver, checkVersionPolicy } from '../dist/version.js';

describe('Version Comparison and Policy Engine', () => {
  describe('compareSemver', () => {
    it('should return 0 when versions are equal', () => {
      assert.equal(compareSemver('1.0.0', '1.0.0'), 0);
      assert.equal(compareSemver('2.15.3', '2.15.3'), 0);
    });

    it('should return 1 when first version is greater than second', () => {
      assert.equal(compareSemver('1.0.1', '1.0.0'), 1);
      assert.equal(compareSemver('1.1.0', '1.0.9'), 1);
      assert.equal(compareSemver('2.0.0', '1.99.99'), 1);
      assert.equal(compareSemver('1.10.0', '1.9.0'), 1);
    });

    it('should return -1 when first version is less than second', () => {
      assert.equal(compareSemver('1.0.0', '1.0.1'), -1);
      assert.equal(compareSemver('1.9.0', '1.10.0'), -1);
      assert.equal(compareSemver('1.5.2', '2.0.0'), -1);
    });

    it('should gracefully handle uneven segment lengths', () => {
      assert.equal(compareSemver('1.0', '1.0.0'), 0);
      assert.equal(compareSemver('1.1', '1.0.9'), 1);
      assert.equal(compareSemver('1.0.0.1', '1.0.0'), 1);
    });
  });

  describe('checkVersionPolicy', () => {
    const standardPolicy = {
      latest_version: '2.0.0',
      minimum_supported_version: '1.5.0',
      force_update: false,
    };

    it('should report no update needed if current version matches or exceeds latest', () => {
      const res1 = checkVersionPolicy('2.0.0', standardPolicy);
      assert.equal(res1.needsUpdate, false);
      assert.equal(res1.isForceUpdate, false);
      assert.equal(res1.latestVersion, '2.0.0');

      const res2 = checkVersionPolicy('2.1.0', standardPolicy);
      assert.equal(res2.needsUpdate, false);
      assert.equal(res2.isForceUpdate, false);
    });

    it('should report soft update if current version is between minimum and latest', () => {
      const res = checkVersionPolicy('1.8.0', standardPolicy);
      assert.equal(res.needsUpdate, true);
      assert.equal(res.isForceUpdate, false);
      assert.equal(res.latestVersion, '2.0.0');
    });

    it('should enforce hard blocking update if current version is below minimum supported', () => {
      const res = checkVersionPolicy('1.4.9', standardPolicy);
      assert.equal(res.needsUpdate, true);
      assert.equal(res.isForceUpdate, true);
      assert.equal(res.latestVersion, '2.0.0');
    });

    it('should enforce hard update if policy specifies force_update: true regardless of version', () => {
      const forcedPolicy = {
        latest_version: '2.0.0',
        minimum_supported_version: '1.0.0',
        force_update: true,
      };

      const res = checkVersionPolicy('1.9.0', forcedPolicy);
      assert.equal(res.needsUpdate, true);
      assert.equal(res.isForceUpdate, true);
    });
  });
});
