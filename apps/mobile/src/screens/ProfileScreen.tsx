import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '../components/ui';
import { colors } from '@nexora/ui-tokens';
import { APP_NAME } from '@nexora/shared';
import { getBrowserClient, signOut, getUserProfile, getUserRoles } from '@nexora/api';
import type { UserProfile, UserRole } from '@nexora/types';
import { useLocalization } from '../context/LocalizationContext';

export interface ProfileScreenProps {
  onSignOut: () => void;
}

export function ProfileScreen({ onSignOut }: ProfileScreenProps) {
  const { locale, setLocale } = useLocalization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(['user']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Preference switches state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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

  const handleSignOut = () => {
    Alert.alert(
      locale === 'bn' ? 'সাইন আউট' : 'Sign Out',
      locale === 'bn' ? 'আপনি কি নিশ্চিত যে সাইন আউট করতে চান?' : 'Are you sure you want to sign out of NEXORA?',
      [
        { text: locale === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'bn' ? 'সাইন আউট' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const client = getBrowserClient();
              await signOut(client);
              onSignOut();
            } catch (err: any) {
              Alert.alert('Sign Out Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Identity Card */}
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

      {/* Language Preference Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'ভাষা নির্বাচন (Language)' : 'Language Selection'}
        </Text>
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[styles.langOption, locale === 'en' && styles.activeLangOption]}
            onPress={() => setLocale('en')}
            activeOpacity={0.7}
          >
            <Ionicons name="flag-outline" size={16} color={locale === 'en' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.langOptionText, locale === 'en' && styles.activeLangOptionText]}>
              English (EN)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langOption, locale === 'bn' && styles.activeLangOption]}
            onPress={() => setLocale('bn')}
            activeOpacity={0.7}
          >
            <Ionicons name="flag-outline" size={16} color={locale === 'bn' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.langOptionText, locale === 'bn' && styles.activeLangOptionText]}>
              বাংলা (BN)
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Account Details Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'অ্যাকাউন্ট তথ্য' : 'Account Details'}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Badge label={profile?.is_verified ? 'Verified' : 'Active'} variant="success" dot />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Locale</Text>
          <Text style={styles.infoValue}>{locale.toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ecosystem Version</Text>
          <Text style={styles.infoValue}>{APP_NAME} Mobile v1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>PostgreSQL Cloud</Text>
          <Text style={styles.infoValue}>Connected • RLS Active</Text>
        </View>
      </Card>

      {/* Preferences Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'অ্যাপ সেটিংস' : 'App Preferences'}
        </Text>
        <View style={styles.preferenceRow}>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Push Notifications</Text>
            <Text style={styles.prefSubtitle}>Receive order, alert & community pings</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#334155', true: colors.primary[600] }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Biometric Authentication</Text>
            <Text style={styles.prefSubtitle}>Use Fingerprint / Face ID to unlock</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: '#334155', true: colors.primary[600] }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      {/* Help & Support Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {locale === 'bn' ? 'সহায়তা ও শর্তাবলী' : 'Support & Terms'}
        </Text>
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={18} color="#94A3B8" />
          <Text style={styles.linkText}>Frequently Asked Questions</Text>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Ionicons name="shield-outline" size={18} color="#94A3B8" />
          <Text style={styles.linkText}>Privacy Policy & Data Security</Text>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
          <Text style={styles.linkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button */}
      <View style={styles.signOutWrapper}>
        <Button
          title={locale === 'bn' ? 'সাইন আউট করুন' : 'Sign Out of NEXORA'}
          variant="outline"
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: colors.neutral[400],
    marginBottom: 10,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    marginBottom: 14,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  activeLangOption: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[500],
  },
  langOptionText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeLangOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.neutral[400],
  },
  infoValue: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  prefTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  prefSubtitle: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
  },
  signOutWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
});
