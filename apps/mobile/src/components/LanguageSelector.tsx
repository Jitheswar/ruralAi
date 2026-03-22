import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@rural-ai/shared';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => setLanguage(lang.code as AppLanguage)}
          style={[
            styles.chip,
            language === lang.code && styles.chipActive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              language === lang.code && styles.chipTextActive,
            ]}
          >
            {lang.nativeLabel}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
