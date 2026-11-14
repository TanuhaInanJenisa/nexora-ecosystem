import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, Input, Card } from '../components/ui';
import { colors } from '@nexora/ui-tokens';
import { APP_NAME } from '@nexora/shared';
import { getBrowserClient, signUp } from '@nexora/api';
import { registerSchema } from '@nexora/validation';

export interface RegisterScreenProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    setErrors({});
    const validation = registerSchema.safeParse({
      full_name: fullName,
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const client = getBrowserClient();
      await signUp(client, {
        full_name: fullName,
        email,
        password,
      });
      Alert.alert('Success', 'Account created successfully!');
      onSuccess();
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Could not register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Join {APP_NAME}</Text>
            <Text style={styles.tagline}>Create your unified digital identity</Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              error={errors.full_name}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="8+ chars, upper, lower, number"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Button
              title="Create Account"
              variant="primary"
              isLoading={isLoading}
              onPress={handleRegister}
              style={styles.submitBtn}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered?</Text>
            <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navy[950],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  tagline: {
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: 4,
  },
  card: {
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral[400],
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[400],
  },
});

