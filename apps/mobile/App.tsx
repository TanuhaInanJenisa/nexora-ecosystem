import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { colors } from '@nexora/ui-tokens';
import { Button, Card, Badge } from './src/components/ui';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { getBrowserClient } from '@nexora/api';

type AuthView = 'splash' | 'login' | 'register' | 'main' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<AuthView>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const client = getBrowserClient();
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setCurrentView('main');
        } else {
          setIsAuthenticated(false);
          setCurrentView('splash');
        }
      } catch (err) {
        console.error('Mobile auth check error:', err);
      }
    }

    checkAuth();

    const client = getBrowserClient();
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentView('main');
      } else {
        setIsAuthenticated(false);
        setCurrentView('splash');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (currentView === 'login') {
    return (
      <LoginScreen
        onSuccess={() => setCurrentView('main')}
        onNavigateToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterScreen
        onSuccess={() => setCurrentView('main')}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <ProfileScreen
        onSignOut={() => setCurrentView('login')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.badgeWrapper}>
          <Badge label={isAuthenticated ? 'AUTHENTICATED' : 'PHASE 04 • AUTH READY'} variant="primary" dot />
        </View>

        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Authentication & RBAC</Text>
          <Text style={styles.cardSubtitle}>
            Supabase Auth, Row Level Security, and role-based permissions are synchronized with the live ecosystem database.
          </Text>

          <View style={styles.actions}>
            {isAuthenticated ? (
              <Button
                title="View My Profile"
                variant="primary"
                onPress={() => setCurrentView('profile')}
              />
            ) : (
              <>
                <Button
                  title="Sign In with Email"
                  variant="primary"
                  onPress={() => setCurrentView('login')}
                />
                <Button
                  title="Create Free Account"
                  variant="outline"
                  onPress={() => setCurrentView('register')}
                />
              </>
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy[950],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badgeWrapper: {
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: colors.neutral[400],
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[400],
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.neutral[300],
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    gap: 12,
  },
});
