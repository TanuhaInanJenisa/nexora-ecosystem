import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { colors } from '@nexora/ui-tokens';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 01 • ACTIVE</Text>
        </View>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Architecture Initialized</Text>
          <Text style={styles.cardSubtitle}>
            React Native + Expo Router ready for Phase 05 integration with Supabase Auth and Dynamic Remote Config.
          </Text>
        </View>
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
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 16,
  },
  badgeText: {
    color: colors.cyan[400],
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
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
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.neutral[800],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[400],
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.neutral[300],
    lineHeight: 20,
  },
});

