import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';

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
        className="flex-row items-center bg-white/20 px-3 py-2 rounded-full"
      >
        <Text style={{ fontSize: 16, marginRight: 4 }}>
          {currentProfile ? '👤' : '🏠'}
        </Text>
        <Text className="text-white text-xs font-medium" numberOfLines={1}>
          {currentProfile ? currentProfile.name : 'Self'}
        </Text>
        <Text className="text-white/60 text-xs ml-1">▼</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setVisible(false)}
        >
          <View className="bg-white rounded-t-3xl px-4 pt-6 pb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Switch Profile
            </Text>

            {/* Self option */}
            <Pressable
              onPress={() => {
                onSwitch(null);
                setVisible(false);
              }}
              className={`flex-row items-center p-4 rounded-xl mb-2 ${
                !currentProfile ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>🏠</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Self</Text>
                <Text className="text-xs text-gray-500">Your own health records</Text>
              </View>
              {!currentProfile && (
                <Text className="text-blue-600 font-bold">✓</Text>
              )}
            </Pressable>

            {/* Managed profiles */}
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
                    className={`flex-row items-center p-4 rounded-xl mb-2 ${
                      isActive ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <Text style={{ fontSize: 24, marginRight: 12 }}>👤</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {item.relation}
                        {item.consentExpiry
                          ? ` · Consent until ${item.consentExpiry}`
                          : ''}
                      </Text>
                    </View>
                    {isActive && (
                      <Text className="text-blue-600 font-bold">✓</Text>
                    )}
                  </Pressable>
                );
              }}
            />

            {profiles.length === 0 && (
              <Text className="text-gray-400 text-center py-4">
                No managed profiles yet
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
