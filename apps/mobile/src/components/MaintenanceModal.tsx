import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@nexora/ui-tokens';
import { useMobileRemoteConfig } from '../context/RemoteConfigContext';
import { Button } from './ui';

export function MaintenanceModal() {
  const {
    isMaintenanceActive,
    maintenance,
    bypassMaintenance,
    refreshConfig,
  } = useMobileRemoteConfig();
  const [showBypassInput, setShowBypassInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isMaintenanceActive) {
    return null;
  }

  const handleBypass = () => {
    setBypassError('');
    const success = bypassMaintenance(secretKey);
    if (!success) {
      setBypassError('Invalid Staff Override Passkey.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshConfig();
    setIsRefreshing(false);
  };

  return (
    <Modal visible={isMaintenanceActive} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Glowing Shield Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="shield-outline" size={44} color="#F59E0B" />
          </View>

          {/* Maintenance Pill */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>SCHEDULED MAINTENANCE</Text>
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>
            {maintenance.title || 'System Maintenance Active'}
          </Text>
          <Text style={styles.message}>
            {maintenance.message ||
              'NEXORA is undergoing planned database enhancements. Services will be restored shortly.'}
          </Text>

          {/* Bengali Note */}
          <View style={styles.bnContainer}>
            <Text style={styles.bnText}>
              বাংলা: নেক্সোরা ইকোসিস্টেমে সিস্টেম আপগ্রেড চলছে। সাময়িক অসুবিধার জন্য দুঃখিত।
            </Text>
          </View>

          {/* Time info if available */}
          {maintenance.end_time && (
            <View style={styles.timeBox}>
              <Ionicons name="time-outline" size={16} color="#94A3B8" />
              <Text style={styles.timeText}>
                Estimated completion:{' '}
                <Text style={styles.timeHighlight}>
                  {new Date(maintenance.end_time).toLocaleTimeString()}
                </Text>
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <Button
              title={isRefreshing ? 'Checking...' : 'Check Live Status'}
              onPress={handleRefresh}
              variant="outline"
              size="md"
            />
          </View>

          {/* Emergency Bypass Drawer */}
          <TouchableOpacity
            onPress={() => setShowBypassInput(!showBypassInput)}
            style={styles.bypassToggle}
          >
            <Ionicons name="key-outline" size={14} color="#818CF8" />
            <Text style={styles.bypassToggleText}>Staff Clearance Override</Text>
          </TouchableOpacity>

          {showBypassInput && (
            <View style={styles.bypassForm}>
              <TextInput
                style={styles.input}
                placeholder="Enter Override Passkey..."
                placeholderTextColor="#64748B"
                secureTextEntry
                value={secretKey}
                onChangeText={setSecretKey}
              />
              <Button title="Unlock" onPress={handleBypass} variant="primary" size="sm" />
              {bypassError ? <Text style={styles.errorText}>{bypassError}</Text> : null}
            </View>
          )}

          {isRefreshing && (
            <ActivityIndicator size="small" color={colors.primary[500]} style={{ marginTop: 12 }} />
          )}
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
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  bnContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
  },
  bnText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    textAlign: 'center',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  timeHighlight: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  actionContainer: {
    width: '100%',
    marginBottom: 12,
  },
  bypassToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  bypassToggleText: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '600',
  },
  bypassForm: {
    width: '100%',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginTop: 8,
    gap: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#F43F5E',
    marginTop: 4,
  },
});
