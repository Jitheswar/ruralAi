import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';

export interface ManagedProfile {
  id: string;
  name: string;
  relation: string;
  consentExpiry?: string;
}

interface ProfileSwitcherProps {
  currentProfile: ManagedProfile | null;
  profiles: ManagedProfile[];
  onSwitch: (profile: ManagedProfile | null) => void;
}

export default function ProfileSwitcher({
  currentProfile,
  profiles,
  onSwitch,
}: ProfileSwitcherProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.switchButton}
      >
        <Text style={{ fontSize: 16, marginRight: 4 }}>
          {currentProfile ? '👤' : '🏠'}
        </Text>
        <Text style={styles.switchButtonText} numberOfLines={1}>
          {currentProfile ? currentProfile.name : 'Self'}
        </Text>
        <Text style={styles.switchButtonArrow}>▼</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Switch Profile
            </Text>

            <Pressable
              onPress={() => {
                onSwitch(null);
                setVisible(false);
              }}
              style={[styles.profileItem, !currentProfile ? styles.profileItemActive : styles.profileItemInactive]}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>🏠</Text>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Self</Text>
                <Text style={styles.profileSubtext}>Your own health records</Text>
              </View>
              {!currentProfile && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>

            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isActive = currentProfile?.id === item.id;
                return (
                  <Pressable
                    onPress={() => {
                      onSwitch(item);
                      setVisible(false);
                    }}
                    style={[styles.profileItem, isActive ? styles.profileItemActive : styles.profileItemInactive]}
                  >
                    <Text style={{ fontSize: 24, marginRight: 12 }}>👤</Text>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>
                        {item.name}
                      </Text>
                      <Text style={styles.profileSubtext}>
                        {item.relation}
                        {item.consentExpiry
                          ? ` · Consent until ${item.consentExpiry}`
                          : ''}
                      </Text>
                    </View>
                    {isActive && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                );
              }}
            />

            {profiles.length === 0 && (
              <Text style={styles.emptyMessage}>
                No managed profiles yet
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  switchButtonArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  profileItemActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  profileItemInactive: {
    backgroundColor: '#F9FAFB',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkmark: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  emptyMessage: {
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
