import type { UserProfile, UserRoleRecord, RolePermissionRecord, UserDevice, UserSession, UserRole, PermissionCode } from './auth';
import type { FeatureFlag, AppSetting, NavigationItem, MaintenanceSettings, AppVersionPolicy } from './config';
import type { ServiceItem, ServiceRequest, SubscriptionPlan, UserSubscription, PaymentTransaction } from './business';
import type { CommunityPost, PostComment, PostReaction, ModerationReport } from './community';
import type { AppNotification } from './notifications';

export interface AuditLogRecord {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface RoleRecord {
  id: string;
  name: UserRole;
  display_name: string;
  description?: string;
  created_at: string;
}

export interface PermissionRecord {
  id: string;
  code: PermissionCode;
  description?: string;
  module: string;
  created_at: string;
}

export interface SupportTicketRecord {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_agent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      roles: { Row: RoleRecord; Insert: Omit<RoleRecord, 'id' | 'created_at'>; Update: Partial<RoleRecord> };
      permissions: { Row: PermissionRecord; Insert: Omit<PermissionRecord, 'id' | 'created_at'>; Update: Partial<PermissionRecord> };
      role_permissions: { Row: RolePermissionRecord; Insert: RolePermissionRecord; Update: Partial<RolePermissionRecord> };
      profiles: { Row: UserProfile; Insert: Partial<UserProfile> & { id: string; email: string }; Update: Partial<UserProfile> };
      user_roles: { Row: UserRoleRecord; Insert: Omit<UserRoleRecord, 'id' | 'created_at'>; Update: Partial<UserRoleRecord> };
      user_devices: { Row: UserDevice; Insert: Omit<UserDevice, 'id' | 'created_at'>; Update: Partial<UserDevice> };
      user_sessions: { Row: UserSession; Insert: Omit<UserSession, 'id' | 'created_at'>; Update: Partial<UserSession> };
      app_settings: { Row: AppSetting; Insert: Omit<AppSetting, 'id' | 'updated_at'>; Update: Partial<AppSetting> };
      feature_flags: { Row: FeatureFlag; Insert: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>; Update: Partial<FeatureFlag> };
      app_versions: { Row: AppVersionPolicy; Insert: AppVersionPolicy; Update: Partial<AppVersionPolicy> };
      maintenance_settings: { Row: MaintenanceSettings; Insert: MaintenanceSettings; Update: Partial<MaintenanceSettings> };
      navigation_items: { Row: NavigationItem; Insert: NavigationItem; Update: Partial<NavigationItem> };
      services: { Row: ServiceItem; Insert: Omit<ServiceItem, 'id' | 'created_at'>; Update: Partial<ServiceItem> };
      service_requests: { Row: ServiceRequest; Insert: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ServiceRequest> };
      subscription_plans: { Row: SubscriptionPlan; Insert: Omit<SubscriptionPlan, 'id'>; Update: Partial<SubscriptionPlan> };
      subscriptions: { Row: UserSubscription; Insert: Omit<UserSubscription, 'id' | 'created_at'>; Update: Partial<UserSubscription> };
      payments: { Row: PaymentTransaction; Insert: Omit<PaymentTransaction, 'id' | 'created_at'>; Update: Partial<PaymentTransaction> };
      posts: { Row: CommunityPost; Insert: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>; Update: Partial<CommunityPost> };
      comments: { Row: PostComment; Insert: Omit<PostComment, 'id' | 'created_at' | 'likes_count'>; Update: Partial<PostComment> };
      post_reactions: { Row: PostReaction; Insert: Omit<PostReaction, 'id' | 'created_at'>; Update: Partial<PostReaction> };
      reports: { Row: ModerationReport; Insert: Omit<ModerationReport, 'id' | 'created_at'>; Update: Partial<ModerationReport> };
      notifications: { Row: AppNotification; Insert: Omit<AppNotification, 'id' | 'created_at'>; Update: Partial<AppNotification> };
      support_tickets: { Row: SupportTicketRecord; Insert: Omit<SupportTicketRecord, 'id' | 'created_at' | 'updated_at'>; Update: Partial<SupportTicketRecord> };
      audit_logs: { Row: AuditLogRecord; Insert: Omit<AuditLogRecord, 'id' | 'created_at'>; Update: never };
    };
  };
}
