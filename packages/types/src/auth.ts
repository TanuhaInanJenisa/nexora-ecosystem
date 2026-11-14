export type UserRole =
  | 'super_admin'
  | 'system_admin'
  | 'manager'
  | 'moderator'
  | 'support_agent'
  | 'finance_admin'
  | 'analyst'
  | 'user';

export type PermissionCode =
  | 'user.read'
  | 'user.write'
  | 'user.update'
  | 'user.suspend'
  | 'user.delete'
  | 'admin.manage'
  | 'app.config.read'
  | 'app.config.update'
  | 'feature.read'
  | 'feature.manage'
  | 'payment.read'
  | 'payment.refund'
  | 'payment.manage'
  | 'content.read'
  | 'content.create'
  | 'content.publish'
  | 'content.delete'
  | 'community.moderate'
  | 'audit.read'
  | 'service.manage'
  | 'ai.manage'
  | 'notification.send';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone_number?: string | null;
  locale: 'en' | 'bn';
  theme: 'light' | 'dark' | 'system';
  is_verified: boolean;
  is_suspended: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by?: string | null;
  created_at: string;
}

export interface RolePermissionRecord {
  id: string;
  role: UserRole;
  permission: PermissionCode;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_token: string;
  platform: 'android' | 'ios' | 'web';
  device_model?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  last_active_at: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device_id?: string | null;
  last_seen_at: string;
  is_revoked: boolean;
  created_at: string;
}

