export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

export type NotificationType =
  | 'system_announcement'
  | 'service_update'
  | 'security_alert'
  | 'community_interaction'
  | 'payment_receipt'
  | 'marketing';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  is_read: boolean;
  read_at?: string | null;
  deep_link?: string;
  created_at: string;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'verified_only' | 'role_based' | 'custom_segment';
  target_roles?: string[];
  scheduled_at?: string;
  sent_at?: string;
  total_delivered: number;
  total_opened: number;
  created_by: string;
  created_at: string;
}

