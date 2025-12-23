import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { ThemeConfig } from '@/config/themes';

interface ThemeCardProps {
  themeConfig: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function ThemeCard({ themeConfig, isSelected, onSelect, disabled }: ThemeCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.surface.primary },
        isSelected && { borderColor: themeConfig.colors.primary, borderWidth: 2 },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: themeConfig.colors.primary }]}>
          <MaterialIcons
            name={themeConfig.icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text.primary }]}>{themeConfig.name}</Text>
          <Text style={[styles.description, { color: theme.text.secondary }]}>
            {themeConfig.description}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color={themeConfig.colors.primary} />
        )}
      </View>

      <View style={styles.colorPreview}>
        <View style={[styles.colorDot, { backgroundColor: themeConfig.colors.primary }]} />
        <View style={[styles.colorDot, { backgroundColor: themeConfig.colors.secondary }]} />
        <View style={[styles.colorDot, { backgroundColor: themeConfig.colors.accent }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  colorPreview: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
