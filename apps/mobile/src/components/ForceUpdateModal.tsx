import React from 'react';
import { Modal, StyleSheet, Text, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMobileRemoteConfig } from '../context/RemoteConfigContext';
import { Button } from './ui';

export function ForceUpdateModal() {
  const { versionStatus, versionPolicy } = useMobileRemoteConfig();

  if (!versionStatus.isForceUpdate) {
    return null;
  }

  const handleUpdate = () => {
    if (versionPolicy.update_url) {
      Linking.openURL(versionPolicy.update_url).catch((err) =>
        console.error('Failed to open update URL:', err)
      );
    }
  };

  return (
    <Modal visible={versionStatus.isForceUpdate} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-download-outline" size={44} color="#6366F1" />
          </View>

          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={12} color="#818CF8" />
            <Text style={styles.badgeText}>MANDATORY UPDATE</Text>
          </View>

          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.message}>
            This version of NEXORA is no longer supported. Please update to version{' '}
            <Text style={styles.highlight}>v{versionPolicy.latest_version}</Text> to continue enjoying seamless services.
          </Text>

          {versionPolicy.release_notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesHeader}>What&apos;s New:</Text>
              <Text style={styles.notesBody}>{versionPolicy.release_notes}</Text>
            </View>
          ) : null}

          <View style={styles.actionContainer}>
            <Button
              title="Update NEXORA Now"
              onPress={handleUpdate}
              variant="primary"
              size="lg"
            />
          </View>

          <Text style={styles.footerNote}>
            Outdated clients are disabled to safeguard ecosystem security.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#0B0F19',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  highlight: {
    color: '#10B981',
    fontWeight: '700',
  },
  notesBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  notesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesBody: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  actionContainer: {
    width: '100%',
    marginBottom: 12,
  },
  footerNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
