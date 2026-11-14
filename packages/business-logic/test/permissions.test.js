import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, hasAllPermissions, ROLE_PERMISSIONS } from '../dist/permissions.js';

describe('RBAC Permissions Engine', () => {
  it('should define distinct permission sets for all 8 standard roles', () => {
    const roles = [
      'super_admin',
      'system_admin',
      'manager',
      'moderator',
      'support_agent',
      'finance_admin',
      'analyst',
      'user',
    ];

    roles.forEach((role) => {
      assert.ok(Array.isArray(ROLE_PERMISSIONS[role]), `ROLE_PERMISSIONS should define array for ${role}`);
      assert.ok(ROLE_PERMISSIONS[role].length > 0, `${role} should have at least one permission`);
    });
  });

  it('super_admin role should bypass and grant any permission unconditionally', () => {
    assert.equal(hasPermission(['super_admin'], 'admin.manage'), true);
    assert.equal(hasPermission(['super_admin'], 'payment.refund'), true);
    assert.equal(hasPermission(['super_admin'], 'user.delete'), true);
    assert.equal(hasPermission(['super_admin'], 'arbitrary.custom.permission'), true);
  });

  it('super_admin should pass hasAllPermissions unconditionally', () => {
    assert.equal(
      hasAllPermissions(['super_admin'], [
        'user.delete',
        'payment.refund',
        'app.config.update',
        'some.other.permission',
      ]),
      true
    );
  });

  it('user role should have restricted read-only permissions', () => {
    assert.equal(hasPermission(['user'], 'content.read'), true);
    assert.equal(hasPermission(['user'], 'content.publish'), false);
    assert.equal(hasPermission(['user'], 'user.delete'), false);
    assert.equal(hasPermission(['user'], 'admin.manage'), false);
  });

  it('moderator role should have moderation and read permissions only', () => {
    assert.equal(hasPermission(['moderator'], 'community.moderate'), true);
    assert.equal(hasPermission(['moderator'], 'user.read'), true);
    assert.equal(hasPermission(['moderator'], 'content.read'), true);
    assert.equal(hasPermission(['moderator'], 'payment.manage'), false);
    assert.equal(hasPermission(['moderator'], 'user.delete'), false);
  });

  it('finance_admin should possess payment and audit permissions', () => {
    assert.equal(hasPermission(['finance_admin'], 'payment.read'), true);
    assert.equal(hasPermission(['finance_admin'], 'payment.refund'), true);
    assert.equal(hasPermission(['finance_admin'], 'payment.manage'), true);
    assert.equal(hasPermission(['finance_admin'], 'audit.read'), true);
    assert.equal(hasPermission(['finance_admin'], 'community.moderate'), false);
    assert.equal(hasPermission(['finance_admin'], 'app.config.update'), false);
  });

  it('should support multiple roles combined', () => {
    const multiRoles = ['moderator', 'finance_admin'];
    assert.equal(hasPermission(multiRoles, 'community.moderate'), true);
    assert.equal(hasPermission(multiRoles, 'payment.read'), true);
    assert.equal(hasPermission(multiRoles, 'admin.manage'), false);

    assert.equal(
      hasAllPermissions(multiRoles, ['community.moderate', 'payment.refund']),
      true
    );
    assert.equal(
      hasAllPermissions(multiRoles, ['community.moderate', 'admin.manage']),
      false
    );
  });

  it('should return false for empty roles or invalid permissions', () => {
    assert.equal(hasPermission([], 'content.read'), false);
    assert.equal(hasAllPermissions([], ['content.read']), false);
  });
});
