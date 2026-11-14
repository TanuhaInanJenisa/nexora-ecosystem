import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '@nexora/ui-tokens';

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[800],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});

