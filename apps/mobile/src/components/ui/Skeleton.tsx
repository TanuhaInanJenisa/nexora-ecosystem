import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface MobileSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 18,
  borderRadius = 8,
  style,
}: MobileSkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1E293B',
    opacity: 0.7,
  },
});
