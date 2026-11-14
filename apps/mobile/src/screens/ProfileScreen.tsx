import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Card, Badge } from '../components/ui';
import { colors } from '@nexora/ui-tokens';
import { APP_NAME } from '@nexora/shared';
import { getBrowserClient, signOut, getUserProfile, getUserRoles } from '@nexora/api';
import type { UserProfile, UserRole } from '@nexora/types';

export interface ProfileScreenProps {
  onSignOut: () => void;
}

export function ProfileScreen({ onSignOut }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(['user']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const client = getBrowserClient();
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const [fetchedProfile, fetchedRoles] = await Promise.all([
            getUserProfile(client, user.id).catch(() => null),
            getUserRoles(client, user.id).catch(() => ['user' as UserRole]),
          ]);
          setProfile(fetchedProfile);
          setRoles(fetchedRoles);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const client = getBrowserClient();
      await signOut(client);
      onSignOut();
    } catch (err: any) {
      Alert.alert('Sign Out Error', err.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.full_name?.[0] || email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || 'NEXORA Member'}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.rolesRow}>
            {roles.map((r) => (
              <Badge key={r} label={r.toUpperCase()} variant="primary" />
            ))}
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Badge label={profile?.is_verified ? 'Verified' : 'Active'} variant="success" dot />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Locale</Text>
            <Text style={styles.infoValue}>{profile?.locale?.toUpperCase() || 'EN'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ecosystem</Text>
            <Text style={styles.infoValue}>{APP_NAME} Mobile v1.0</Text>
          </View>
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navy[950],
  },
  container: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  email: {
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  card: {
    marginBottom: 24,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[200],
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[900],
  },
  infoLabel: {
    fontSize: 13,
    color: colors.neutral[400],
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[200],
  },
  signOutBtn: {
    marginTop: 8,
  },
});
