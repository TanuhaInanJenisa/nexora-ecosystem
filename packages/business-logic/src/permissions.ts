import type { UserRole, PermissionCode } from '@nexora/types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  super_admin: [
    'user.read',
    'user.write',
    'user.update',
    'user.suspend',
    'user.delete',
    'admin.manage',
    'app.config.read',
    'app.config.update',
    'feature.read',
    'feature.manage',
    'payment.read',
    'payment.refund',
    'payment.manage',
    'content.read',
    'content.create',
    'content.publish',
    'content.delete',
    'community.moderate',
    'audit.read',
    'service.manage',
    'ai.manage',
    'notification.send',
  ],
  system_admin: [
    'user.read',
    'user.write',
    'user.update',
    'user.suspend',
    'app.config.read',
    'app.config.update',
    'feature.read',
    'feature.manage',
    'audit.read',
    'content.read',
    'content.publish',
    'community.moderate',
    'notification.send',
  ],
  manager: [
    'user.read',
    'content.read',
    'content.create',
    'content.publish',
    'service.manage',
    'community.moderate',
    'notification.send',
  ],
  moderator: [
    'user.read',
    'content.read',
    'community.moderate',
  ],
  support_agent: [
    'user.read',
    'content.read',
  ],
  finance_admin: [
    'payment.read',
    'payment.refund',
    'payment.manage',
    'audit.read',
  ],
  analyst: [
    'audit.read',
    'content.read',
  ],
  user: [
    'content.read',
  ],
};

/**
 * Checks whether a user with given roles has a specific permission.
 */
export function hasPermission(userRoles: UserRole[], requiredPermission: PermissionCode): boolean {
  if (userRoles.includes('super_admin')) {
    return true;
  }
  return userRoles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(requiredPermission) : false;
  });
}

/**
 * Checks if a user has all of the required permissions.
 */
export function hasAllPermissions(userRoles: UserRole[], requiredPermissions: PermissionCode[]): boolean {
  if (userRoles.includes('super_admin')) {
    return true;
  }
  return requiredPermissions.every((perm) => hasPermission(userRoles, perm));
}

