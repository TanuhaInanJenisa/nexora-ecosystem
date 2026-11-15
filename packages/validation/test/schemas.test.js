import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginSchema,
  registerSchema,
  otpVerifySchema,
  serviceRequestSchema,
  featureFlagSchema,
  maintenanceSettingsSchema,
} from '../dist/index.js';

describe('Validation Schemas Suite', () => {
  describe('loginSchema', () => {
    it('should validate valid email and password credentials', () => {
      const valid = { email: 'admin@nexora.io', password: 'securePassword123' };
      const result = loginSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it('should reject invalid email formats', () => {
      const invalid = { email: 'not-a-valid-email', password: 'securePassword123' };
      const result = loginSchema.safeParse(invalid);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes('email')));
      }
    });

    it('should reject passwords shorter than 8 characters', () => {
      const short = { email: 'admin@nexora.io', password: 'short' };
      const result = loginSchema.safeParse(short);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes('password')));
      }
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration payloads with strong passwords', () => {
      const valid = {
        email: 'newuser@nexora.io',
        password: 'Password99!',
        full_name: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it('should reject passwords lacking uppercase letters', () => {
      const noUpper = {
        email: 'newuser@nexora.io',
        password: 'password99!',
        full_name: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(noUpper);
      assert.equal(result.success, false);
    });

    it('should reject passwords lacking numeric digits', () => {
      const noDigit = {
        email: 'newuser@nexora.io',
        password: 'PasswordUpper!',
        full_name: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(noDigit);
      assert.equal(result.success, false);
    });

    it('should reject full names shorter than 2 characters', () => {
      const shortName = {
        email: 'newuser@nexora.io',
        password: 'Password99!',
        full_name: 'A',
      };
      const result = registerSchema.safeParse(shortName);
      assert.equal(result.success, false);
    });
  });

  describe('otpVerifySchema', () => {
    it('should validate exact 6-digit numeric OTP codes', () => {
      const valid = { email: 'verify@nexora.io', token: '489201' };
      const result = otpVerifySchema.safeParse(valid);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.type, 'signup'); // default value
      }
    });

    it('should reject non-numeric or non-6-digit tokens', () => {
      assert.equal(otpVerifySchema.safeParse({ email: 'v@nexora.io', token: '12345' }).success, false);
      assert.equal(otpVerifySchema.safeParse({ email: 'v@nexora.io', token: '1234567' }).success, false);
      assert.equal(otpVerifySchema.safeParse({ email: 'v@nexora.io', token: 'ABCDEF' }).success, false);
    });
  });

  describe('serviceRequestSchema', () => {
    it('should validate valid UUID service requests', () => {
      const valid = {
        service_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        notes: 'Priority consultation required',
      };
      const result = serviceRequestSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it('should reject malformed UUIDs', () => {
      const invalid = { service_id: 'not-a-uuid-string' };
      const result = serviceRequestSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe('featureFlagSchema', () => {
    it('should accept properly formatted feature flag definitions', () => {
      const flag = {
        key: 'ai_smart_search',
        name: 'AI Smart Search',
        description: 'Semantic vector search across ecosystem content',
        is_enabled: true,
        rollout_percentage: 75,
      };
      const result = featureFlagSchema.safeParse(flag);
      assert.equal(result.success, true);
    });

    it('should reject invalid rollout percentages below 0 or above 100', () => {
      const invalid1 = { key: 'test_flag', name: 'Test', is_enabled: true, rollout_percentage: -5 };
      const invalid2 = { key: 'test_flag', name: 'Test', is_enabled: true, rollout_percentage: 105 };
      assert.equal(featureFlagSchema.safeParse(invalid1).success, false);
      assert.equal(featureFlagSchema.safeParse(invalid2).success, false);
    });

    it('should reject keys with uppercase characters or spaces', () => {
      const badKey = { key: 'Invalid Key!', name: 'Test', is_enabled: true, rollout_percentage: 50 };
      assert.equal(featureFlagSchema.safeParse(badKey).success, false);
    });
  });

  describe('maintenanceSettingsSchema', () => {
    it('should validate complete maintenance settings configuration', () => {
      const settings = {
        is_enabled: false,
        title: 'Routine Database Maintenance',
        message: 'Platform scheduled upgrade in progress.',
        allowed_roles: ['super_admin'],
        allowed_ips: ['127.0.0.1'],
      };
      const result = maintenanceSettingsSchema.safeParse(settings);
      assert.equal(result.success, true);
    });
  });
});

