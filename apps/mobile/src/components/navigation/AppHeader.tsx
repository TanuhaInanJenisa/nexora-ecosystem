import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { APP_NAME } from '@nexora/shared';
import { useLocalization } from '../../context/LocalizationContext';

interface AppHeaderProps {
  onNotificationPress: () => void;
  onProfilePress: () => void;
  unreadCount?: number;
  userInitial?: string;
}

export function AppHeader({
  onNotificationPress,
  onProfilePress,
  unreadCount = 0,
  userInitial = 'U',
}: AppHeaderProps) {
  const { locale, toggleLocale } = useLocalization();

  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <View>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.appTagline}>Ecosystem</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.langPill}
          onPress={toggleLocale}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={14} color={colors.primary[300]} style={styles.langIcon} />
          <Text style={styles.langText}>{locale.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color="#E2E8F0" />
          {unreadCount > 0 && (
            <View style={styles.notificationDot} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarInitial}>{userInitial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  appName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  appTagline: {
    color: colors.neutral[400],
    fontSize: 11,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  langIcon: {
    marginRight: 4,
  },
  langText: {
    color: colors.primary[300],
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[400],
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

