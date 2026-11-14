import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BOOT_CONFIG,
  AI_SUGGESTION_CHIPS,
  sendAIChatMessage,
} from '../dist/index.js';

describe('API Package & Default Config Suite', () => {
  describe('DEFAULT_BOOT_CONFIG', () => {
    it('should provide comprehensive default boot configuration', () => {
      assert.ok(DEFAULT_BOOT_CONFIG);
      assert.equal(typeof DEFAULT_BOOT_CONFIG.version, 'string');
      assert.ok(DEFAULT_BOOT_CONFIG.maintenance);
      assert.equal(DEFAULT_BOOT_CONFIG.maintenance.is_enabled, false);
      assert.ok(DEFAULT_BOOT_CONFIG.maintenance.allowed_roles.includes('super_admin'));
    });

    it('should supply version policies for web, android, and ios', () => {
      const { version_policy } = DEFAULT_BOOT_CONFIG;
      assert.ok(version_policy.web);
      assert.ok(version_policy.android);
      assert.ok(version_policy.ios);

      assert.equal(version_policy.web.platform, 'web');
      assert.equal(version_policy.android.platform, 'android');
      assert.equal(version_policy.ios.platform, 'ios');

      assert.equal(typeof version_policy.web.latest_version, 'string');
      assert.equal(typeof version_policy.android.latest_version, 'string');
      assert.equal(typeof version_policy.ios.latest_version, 'string');
    });

    it('should configure default ecosystem feature flags', () => {
      const { features } = DEFAULT_BOOT_CONFIG;
      assert.ok(features);
      assert.equal(features['ai-assistant'], true);
      assert.equal(features['push-notifications'], true);
    });
  });

  describe('AI Assistant Engine', () => {
    it('should expose curated quick-suggestion prompt chips', () => {
      assert.ok(Array.isArray(AI_SUGGESTION_CHIPS));
      assert.ok(AI_SUGGESTION_CHIPS.length >= 4);
    });

    it('should respond intelligently to architectural questions', async () => {
      const response = await sendAIChatMessage({
        message: 'Tell me about Monorepo Architecture and Turborepo',
      });

      assert.ok(response);
      assert.ok(response.reply.length > 50);
      assert.match(response.reply, /Turborepo|pnpm|monorepo/i);
    });

    it('should respond accurately to Bengali localized queries', async () => {
      const response = await sendAIChatMessage({
        message: 'নেক্সোরা ইকোসিস্টেমের সুবিধা কী?',
      });

      assert.ok(response);
      assert.ok(response.reply.length > 30);
    });
  });
});
