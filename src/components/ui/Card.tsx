import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, radius, spacing, shadows } from '@/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Card({ children, variant = 'elevated', padding = 4, style }: CardProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.surface.primary,
          borderWidth: 1,
          borderColor: theme.border.primary,
        };
      case 'filled':
        return {
          backgroundColor: theme.surface.secondary,
        };
      default:
        return {
          backgroundColor: theme.surface.elevated,
          ...shadows.md,
        };
    }
  };

  return (
    <View style={[styles.base, getVariantStyles(), { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
});
