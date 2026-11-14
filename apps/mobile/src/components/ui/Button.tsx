import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '@nexora/ui-tokens';

export interface MobileButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
}: MobileButtonProps) {
  const isActionDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isActionDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isActionDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? colors.primary[500] : colors.white} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.textBase,
              styles[`${variant}Text` as keyof typeof styles],
              styles[`${size}Text` as keyof typeof styles],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
  },
  sm: {
    height: 38,
    paddingHorizontal: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 18,
  },
  lg: {
    height: 56,
    paddingHorizontal: 22,
  },
  primary: {
    backgroundColor: colors.primary[600],
  },
  violet: {
    backgroundColor: colors.violet[600],
  },
  secondary: {
    backgroundColor: colors.neutral[800],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  danger: {
    backgroundColor: colors.status.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '600',
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
  },
  primaryText: {
    color: colors.white,
  },
  violetText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.neutral[100],
  },
  outlineText: {
    color: colors.neutral[200],
  },
  dangerText: {
    color: colors.white,
  },
});

