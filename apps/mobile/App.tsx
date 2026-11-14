import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { colors } from '@nexora/ui-tokens';
import { Button, Card, Badge } from './src/components/ui';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AppHeader } from './src/components/navigation/AppHeader';
import { BottomTabBar, TabKey } from './src/components/navigation/BottomTabBar';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';
import { getBrowserClient, getUserProfile } from '@nexora/api';

type AuthView = 'splash' | 'login' | 'register' | 'main';

function MainApp() {
  const { locale } = useLocalization();
  const [currentView, setCurrentView] = useState<AuthView>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [exploreCategory, setExploreCategory] = useState<string | undefined>(undefined);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [userName, setUserName] = useState('Member');
  const [userInitial, setUserInitial] = useState('U');

  useEffect(() => {
    async function checkAuth() {
      try {
        const client = getBrowserClient();
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setCurrentView('main');
          loadUserProfile(session.user.id, session.user.email || '');
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
    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentView('main');
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsAuthenticated(false);
        setCurrentView('splash');
        setUserName('Member');
        setUserInitial('U');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const client = getBrowserClient();
      const profile = await getUserProfile(client, userId);
      if (profile?.full_name) {
        setUserName(profile.full_name);
        setUserInitial(profile.full_name[0].toUpperCase());
      } else if (email) {
        setUserName(email.split('@')[0]);
        setUserInitial(email[0].toUpperCase());
      }
    } catch {
      if (email) {
        setUserName(email.split('@')[0]);
        setUserInitial(email[0].toUpperCase());
      }
    }
  };

  const handleNavigateToExplore = (category?: string) => {
    setExploreCategory(category);
    setActiveTab('explore');
  };

  const handleNavigateToCommunity = () => {
    setActiveTab('community');
  };

  if (currentView === 'login') {
    return (
      <LoginScreen
        onSuccess={() => {
          setIsAuthenticated(true);
          setCurrentView('main');
        }}
        onNavigateToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterScreen
        onSuccess={() => {
          setIsAuthenticated(true);
          setCurrentView('main');
        }}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  // Not authenticated splash view
  if (!isAuthenticated || currentView === 'splash') {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashContent}>
          <View style={styles.badgeWrapper}>
            <Badge label="NEXORA ECOSYSTEM v1.0" variant="primary" dot />
          </View>

          <Text style={styles.splashTitle}>{APP_NAME}</Text>
          <Text style={styles.splashTagline}>{APP_TAGLINE}</Text>

          <Card style={styles.splashCard}>
            <Text style={styles.splashCardTitle}>
              {locale === 'bn' ? 'সেন্ট্রাল ডিজিটাল প্ল্যাটফর্ম' : 'Central Digital Platform'}
            </Text>
            <Text style={styles.splashCardSubtitle}>
              {locale === 'bn'
                ? 'মোবাইল, ওয়েব এবং অ্যাডমিনের সমন্বয়ে একটি সমন্বিত প্ল্যাটফর্ম। এখনই আপনার অ্যাকাউন্টে সাইন ইন করুন।'
                : 'Unified cross-platform ecosystem for enterprise applications, dynamic cloud configuration, and community.'}
            </Text>

            <View style={styles.splashActions}>
              <Button
                title={locale === 'bn' ? 'লগইন করুন' : 'Sign In'}
                variant="primary"
                onPress={() => setCurrentView('login')}
              />
              <Button
                title={locale === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}
                variant="outline"
                onPress={() => setCurrentView('register')}
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated Main View with 5 Tabs
  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar style="light" />

      {/* Top Header */}
      <AppHeader
        unreadCount={unreadNotifications}
        userInitial={userInitial}
        onNotificationPress={() => setActiveTab('notifications')}
        onProfilePress={() => setActiveTab('profile')}
      />

      {/* Active Tab Screen */}
      <View style={styles.screenWrapper}>
        {activeTab === 'home' && (
          <HomeScreen
            userName={userName}
            onNavigateToExplore={handleNavigateToExplore}
            onNavigateToCommunity={handleNavigateToCommunity}
          />
        )}
        {activeTab === 'explore' && (
          <ExploreScreen initialCategory={exploreCategory} />
        )}
        {activeTab === 'community' && (
          <CommunityScreen />
        )}
        {activeTab === 'notifications' && (
          <NotificationsScreen onUnreadCountChange={setUnreadNotifications} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen
            onSignOut={() => {
              setIsAuthenticated(false);
              setCurrentView('splash');
            }}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'explore') setExploreCategory(undefined);
        }}
        unreadNotificationsCount={unreadNotifications}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LocalizationProvider>
      <MainApp />
    </LocalizationProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  badgeWrapper: {
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    marginBottom: 4,
  },
  splashTagline: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: 32,
  },
  splashCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
  },
  splashCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  splashCardSubtitle: {
    fontSize: 13,
    color: colors.neutral[400],
    lineHeight: 20,
    marginBottom: 24,
  },
  splashActions: {
    gap: 12,
  },
});
