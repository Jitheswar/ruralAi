import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
      <View style={styles.userMessageContainer}>
        <View style={styles.userMessageBubble}>
          <Text style={styles.userMessageText}>{text}</Text>
        </View>
      </View>
    );
  }

  const severityStyles = severity ? SEVERITY_STYLES[severity] : null;

  return (
    <View style={styles.systemMessageContainer}>
      <View
        style={[
          styles.systemMessageBubble,
          severityStyles
            ? { backgroundColor: severityStyles.bg, borderLeftWidth: 3, borderLeftColor: severityStyles.border }
            : styles.systemMessageBubbleDefault
        ]}
      >
        <Text style={styles.systemMessageText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  userMessageBubble: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    borderBottomRightRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#ffffff',
    fontSize: 14,
  },
  systemMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  systemMessageBubble: {
    borderRadius: 16,
    borderBottomLeftRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
  },
  systemMessageBubbleDefault: {
    backgroundColor: '#F3F4F6',
  },
  systemMessageText: {
    color: '#1F2937',
    fontSize: 14,
  },
});
