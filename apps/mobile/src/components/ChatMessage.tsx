import React from 'react';
import { View, Text } from 'react-native';

interface ChatMessageProps {
  type: 'user' | 'system';
  text: string;
  severity?: 'critical' | 'warning' | 'info';
}

const SEVERITY_STYLES = {
  critical: { border: '#DC2626', bg: '#FEF2F2' },
  warning: { border: '#D97706', bg: '#FFFBEB' },
  info: { border: '#2563EB', bg: '#EFF6FF' },
};

export default function ChatMessage({ type, text, severity }: ChatMessageProps) {
  if (type === 'user') {
    return (
      <View className="flex-row justify-end mb-3">
        <View className="bg-primary rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
          <Text className="text-white text-sm">{text}</Text>
        </View>
      </View>
    );
  }

  const styles = severity ? SEVERITY_STYLES[severity] : null;

  return (
    <View className="flex-row justify-start mb-3">
      <View
        className="rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]"
        style={
          styles
            ? { backgroundColor: styles.bg, borderLeftWidth: 3, borderLeftColor: styles.border }
            : { backgroundColor: '#F3F4F6' }
        }
      >
        <Text className="text-gray-800 text-sm">{text}</Text>
      </View>
    </View>
  );
}
