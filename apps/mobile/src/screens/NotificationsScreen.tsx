import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { Card } from '../components/ui';
import { useLocalization } from '../context/LocalizationContext';
import {
  getBrowserClient,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@nexora/api';

export interface NotificationItem {
  id: string;
  type: 'security' | 'system' | 'service' | 'community';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'security',
    title: 'New Session Authenticated',
    message: 'Your account was successfully signed in via Supabase Auth from a trusted device.',
    timestamp: '10m ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'NEXORA Ecosystem v1.0 Booted',
    message: 'All 30 administrative modules and PostgreSQL RLS extensions are fully operational.',
    timestamp: '1h ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'service',
    title: 'Service Catalog Live',
    message: 'Explore newly added AI automation workflows and fullstack monorepo templates.',
    timestamp: '1d ago',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'community',
    title: 'Welcome to NEXORA Community',
    message: 'Connect with developers and builders building unlimited possibilities.',
    timestamp: '2d ago',
    isRead: true,
  },
];

interface NotificationsScreenProps {
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationsScreen({ onUnreadCountChange }: NotificationsScreenProps) {
  const { locale } = useLocalization();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'All' | 'Unread' | 'System'>('All');

  const client = getBrowserClient();

  React.useEffect(() => {
    async function loadRemoteNotifs() {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user?.id) {
          const remoteNotifs = await fetchUserNotifications(client, session.user.id);
          if (remoteNotifs && remoteNotifs.length > 0) {
            const mapped: NotificationItem[] = remoteNotifs.map((n) => ({
              id: n.id,
              type:
                n.type === 'security_alert'
                  ? 'security'
                  : n.type === 'service_update'
                  ? 'service'
                  : 'system',
              title: n.title,
              message: n.body,
              timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: n.is_read,
            }));
            setNotifications(mapped);
            if (onUnreadCountChange) {
              onUnreadCountChange(mapped.filter((x) => !x.isRead).length);
            }
          }
        }
      } catch (err) {
        console.warn('Mobile notifications remote load caught:', err);
      }
    }
    loadRemoteNotifs();
  }, [client, onUnreadCountChange]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onUnreadCountChange) onUnreadCountChange(0);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user?.id) {
        await markAllNotificationsAsRead(client, session.user.id);
      }
    } catch (err) {
      console.warn('markAllNotificationsAsRead caught:', err);
    }
  };

  const toggleNotificationRead = async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const remainingUnread = updated.filter((n) => !n.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
      return updated;
    });
    try {
      await markNotificationAsRead(client, id);
    } catch (err) {
      console.warn('markNotificationAsRead caught:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'System') return n.type === 'system' || n.type === 'security';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'security':
        return { name: 'shield-checkmark' as const, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'system':
        return { name: 'hardware-chip' as const, color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.15)' };
      case 'service':
        return { name: 'cube' as const, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' };
      case 'community':
        return { name: 'chatbubbles' as const, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {locale === 'bn' ? 'বিজ্ঞপ্তি কেন্দ্র' : 'Notifications'}
          </Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? locale === 'bn'
                ? `${unreadCount}টি অপঠিত বার্তা রয়েছে`
                : `${unreadCount} unread updates`
              : locale === 'bn'
              ? 'সব বার্তা পড়া হয়েছে'
              : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markReadButton} activeOpacity={0.7}>
            <Text style={styles.markReadText}>
              {locale === 'bn' ? 'সব পঠিত করুন' : 'Mark all read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        {(['All', 'Unread', 'System'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, isActive && styles.activeFilterChip]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notification List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.neutral[600]} />
            <Text style={styles.emptyText}>
              {locale === 'bn' ? 'কোনো বিজ্ঞপ্তি পাওয়া যায়নি' : 'No notifications in this filter'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((n) => {
            const iconConfig = getIcon(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => toggleNotificationRead(n.id)}
                activeOpacity={0.8}
              >
                <Card style={[styles.card, !n.isRead && styles.unreadCard]}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                      <Ionicons name={iconConfig.name} size={18} color={iconConfig.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.notifTitle, !n.isRead && styles.unreadTitle]}>
                          {n.title}
                        </Text>
                        {!n.isRead && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notifMessage}>{n.message}</Text>
                      <Text style={styles.notifTime}>{n.timestamp}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 2,
  },
  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  markReadText: {
    fontSize: 11,
    color: colors.primary[300],
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilterChip: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: 12,
    color: colors.neutral[300],
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    padding: 14,
  },
  unreadCard: {
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(30, 27, 75, 0.3)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  notifMessage: {
    fontSize: 12,
    color: colors.neutral[300],
    lineHeight: 17,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 10,
    color: colors.neutral[500],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[400],
  },
});

