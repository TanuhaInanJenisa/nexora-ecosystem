import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@nexora/ui-tokens';
import { Button } from './Button';

export interface MobileEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: MobileEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>📁</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onAction && (
        <View style={styles.btnWrapper}>
          <Button title={actionText} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.neutral[800],
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  btnWrapper: {
    marginTop: 20,
    width: '100%',
  },
});
