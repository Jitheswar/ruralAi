import React from 'react';
import { Pressable, Text } from 'react-native';

const CATEGORY_COLORS: Record<string, { bg: string; bgSelected: string; text: string }> = {
  cardiac: { bg: '#FEE2E2', bgSelected: '#DC2626', text: '#991B1B' },
  neuro: { bg: '#E0E7FF', bgSelected: '#4F46E5', text: '#3730A3' },
  respiratory: { bg: '#DBEAFE', bgSelected: '#2563EB', text: '#1E40AF' },
  gastro: { bg: '#FEF3C7', bgSelected: '#D97706', text: '#92400E' },
  general: { bg: '#E5E7EB', bgSelected: '#6B7280', text: '#374151' },
};

interface SymptomBubbleProps {
  id: string;
  label: string;
  category: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export default function SymptomBubble({
  id,
  label,
  category,
  isSelected,
  onToggle,
}: SymptomBubbleProps) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;

  return (
    <Pressable
      onPress={() => onToggle(id)}
      style={{
        backgroundColor: isSelected ? colors.bgSelected : colors.bg,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        margin: 4,
      }}
    >
      <Text
        style={{
          color: isSelected ? '#FFFFFF' : colors.text,
          fontWeight: isSelected ? '600' : '400',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
