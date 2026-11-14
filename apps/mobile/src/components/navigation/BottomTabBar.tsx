import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { useLocalization } from '../../context/LocalizationContext';

export type TabKey = 'home' | 'explore' | 'community' | 'notifications' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  unreadNotificationsCount?: number;
}

export function BottomTabBar({
  activeTab,
  onTabChange,
  unreadNotificationsCount = 0,
}: BottomTabBarProps) {
  const { t } = useLocalization();

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }> = [
    {
      key: 'home',
      label: t.nav.home,
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      key: 'explore',
      label: t.nav.explore,
      icon: 'compass-outline',
      activeIcon: 'compass',
    },
    {
      key: 'community',
      label: t.nav.community,
      icon: 'chatbubbles-outline',
      activeIcon: 'chatbubbles',
    },
    {
      key: 'notifications',
      label: t.nav.notifications,
      icon: 'notifications-outline',
      activeIcon: 'notifications',
    },
    {
      key: 'profile',
      label: t.nav.profile,
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary[500] : colors.neutral[400]}
              />
              {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.primary[500] : colors.neutral[400] },
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

