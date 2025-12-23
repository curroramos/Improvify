import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface SettingsRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'danger';
}

export function SettingsRow({
  icon,
  label,
  onPress,
  showChevron = false,
  variant = 'default',
}: SettingsRowProps) {
  const { theme } = useTheme();
  const isDanger = variant === 'danger';
  const color = isDanger ? '#EF4444' : theme.text.primary;
  const iconColor = isDanger ? '#EF4444' : theme.text.secondary;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.surface.primary }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={20} color={iconColor} />
      <Text style={[styles.label, { color }]}>{label}</Text>
      {showChevron && <MaterialIcons name="chevron-right" size={20} color={theme.text.tertiary} />}
      {!showChevron && <View style={styles.spacer} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  spacer: {
    width: 20,
  },
});
