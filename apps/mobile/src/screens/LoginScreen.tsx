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
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { getBrowserClient, signIn } from '@nexora/api';
import { loginSchema } from '@nexora/validation';

export interface LoginScreenProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    setErrors({});
    const validation = loginSchema.safeParse({ email, password });
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
      await signIn(client, { email, password });
      onSuccess();
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials provided.');
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
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>NX</Text>
            </View>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.tagline}>{APP_TAGLINE}</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Mobile Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to sync your profile and access ecosystem services.
            </Text>

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
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Button
              title="Sign In"
              variant="primary"
              isLoading={isLoading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Create Account</Text>
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
    marginBottom: 32,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.neutral[400],
    marginBottom: 20,
    lineHeight: 18,
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
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[400],
  },
});

