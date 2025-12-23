import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LifeCategory } from '@/types';
import { getCategoryConfig } from '@/constants/Categories';

interface CategoryBadgeProps {
  category: LifeCategory;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showIcon?: boolean;
  variant?: 'filled' | 'outlined' | 'gradient';
  onPress?: () => void;
}

export function CategoryBadge({
  category,
  size = 'medium',
  showLabel = true,
  showIcon = true,
  variant = 'filled',
  onPress,
}: CategoryBadgeProps) {
  const config = getCategoryConfig(category);

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      iconSize: 12,
      fontSize: 10,
      borderRadius: 8,
      gap: 4,
    },
    medium: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      iconSize: 14,
      fontSize: 12,
      borderRadius: 10,
      gap: 5,
    },
    large: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      iconSize: 18,
      fontSize: 14,
      borderRadius: 12,
      gap: 6,
    },
  };

  const currentSize = sizeStyles[size];

  const content = (
    <>
      {showIcon && (
        <MaterialIcons
          name={config.icon as keyof typeof MaterialIcons.glyphMap}
          size={currentSize.iconSize}
          color={variant === 'gradient' ? '#fff' : config.color}
        />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: currentSize.fontSize,
              color: variant === 'gradient' ? '#fff' : config.color,
            },
          ]}
        >
          {config.shortLabel}
        </Text>
      )}
    </>
  );

  const containerStyle = [
    styles.container,
    {
      paddingHorizontal: currentSize.paddingHorizontal,
      paddingVertical: currentSize.paddingVertical,
      borderRadius: currentSize.borderRadius,
      gap: currentSize.gap,
    },
    variant === 'filled' && { backgroundColor: `${config.color}20` },
    variant === 'outlined' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: config.color,
    },
  ];

  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            {
              paddingHorizontal: currentSize.paddingHorizontal,
              paddingVertical: currentSize.paddingVertical,
              borderRadius: currentSize.borderRadius,
              gap: currentSize.gap,
            },
          ]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

// Icon-only variant for compact displays
export function CategoryIcon({
  category,
  size = 20,
  color,
}: {
  category: LifeCategory;
  size?: number;
  color?: string;
}) {
  const config = getCategoryConfig(category);
  return (
    <MaterialIcons
      name={config.icon as keyof typeof MaterialIcons.glyphMap}
      size={size}
      color={color ?? config.color}
    />
  );
}

// Dot indicator for minimal category display
export function CategoryDot({ category, size = 8 }: { category: LifeCategory; size?: number }) {
  const config = getCategoryConfig(category);
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
