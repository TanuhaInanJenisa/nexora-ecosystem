import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors } from '@nexora/ui-tokens';

export interface MobileInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  isPassword = false,
  style,
  ...props
}: MobileInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.neutral[500]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureText}
          style={[styles.input, style]}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeBtn}
          >
            <Text style={styles.eyeText}>{secureText ? 'SHOW' : 'HIDE'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[300],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 50,
    backgroundColor: '#131B2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[800],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: colors.primary[500],
  },
  inputError: {
    borderColor: colors.status.danger,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary[400],
  },
  errorText: {
    fontSize: 12,
    color: colors.status.danger,
    marginTop: 4,
  },
});

