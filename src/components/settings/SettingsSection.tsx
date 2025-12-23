import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, subtitle, children }: SettingsSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
});
