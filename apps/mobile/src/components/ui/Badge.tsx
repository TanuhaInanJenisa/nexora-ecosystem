import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@nexora/ui-tokens';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface MobileBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const badgeVariants: Record<BadgeVariant, ViewStyle> = {
  primary: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
};

const dotColors: Record<BadgeVariant, string> = {
  primary: colors.primary[400],
  success: colors.status.success,
  warning: colors.status.warning,
  danger: colors.status.danger,
  info: colors.cyan[400],
};

const textColors: Record<BadgeVariant, TextStyle> = {
  primary: { color: colors.primary[300] },
  success: { color: '#34D399' },
  warning: { color: '#FBBF24' },
  danger: { color: '#F87171' },
  info: { color: colors.cyan[300] },
};

export function Badge({ label, variant = 'primary', dot = false }: MobileBadgeProps) {
  return (
    <View style={[styles.badge, badgeVariants[variant]]}>
      {dot && <View style={[styles.dot, { backgroundColor: dotColors[variant] }]} />}
      <Text style={[styles.text, textColors[variant]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
