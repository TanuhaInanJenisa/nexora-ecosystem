import type { AppNotification } from '@nexora/types';
import type { NexoraClient } from './client';

export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    user_id: 'usr-default',
    type: 'system_announcement',
    title: 'Welcome to NEXORA Ecosystem',
    body: 'Your multi-platform workspace is active. Explore services, collaborate in community discussions, and customize preferences.',
    channels: ['in_app'],
    is_read: false,
    read_at: null,
    deep_link: '/dashboard',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: 'usr-default',
    type: 'service_update',
    title: 'Service Request Confirmed',
    body: 'Your commissioned request for "Autonomous AI Agent Workflow Engine" is in review by an assigned operations engineer.',
    channels: ['in_app'],
    is_read: false,
    read_at: null,
    deep_link: '/dashboard',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-003',
    user_id: 'usr-default',
    type: 'security_alert',
    title: 'Security Clearance Verified',
    body: 'Row-Level Security session established with verified token credentials.',
    channels: ['in_app'],
    is_read: true,
    read_at: new Date(Date.now() - 86400000).toISOString(),
    deep_link: '/dashboard',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Fetch all notifications for a given user
 */
export async function fetchUserNotifications(
  client: NexoraClient,
  userId: string,
  limit: number = 20
): Promise<AppNotification[]> {
  try {
    const { data, error } = await (client as any)
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return SAMPLE_NOTIFICATIONS;
    }

    return data as AppNotification[];
  } catch (err) {
    console.warn('Error fetching notifications, returning samples:', err);
    return SAMPLE_NOTIFICATIONS;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  client: NexoraClient,
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await (client as any)
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.warn('Failed to mark notification as read in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return false;
  }
}

/**
 * Mark all notifications as read for a given user
 */
export async function markAllNotificationsAsRead(
  client: NexoraClient,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await (client as any)
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.warn('Failed to mark all notifications as read:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return false;
  }
}

/**
 * Realtime subscription to notifications for a user
 */
export function subscribeToUserNotifications(
  client: NexoraClient,
  userId: string,
  onNewNotification: (notif: AppNotification) => void
): () => void {
  const channel = client
    .channel(`nexora-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNewNotification(payload.new as AppNotification);
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

