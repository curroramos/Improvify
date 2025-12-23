import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, FadeIn } from 'react-native-reanimated';
import { useTheme, spacing, textStyles } from '@/theme';

type PromptProgressProps = {
  total: number;
  current: number;
};

export function PromptProgress({ total, current }: PromptProgressProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {Array.from({ length: total }).map((_, index) => (
          <Dot
            key={index}
            isActive={index === current}
            isCompleted={index < current}
            activeColor={theme.brand.primary}
            inactiveColor={theme.border.primary}
          />
        ))}
      </View>
      <Animated.Text
        entering={FadeIn.duration(300)}
        style={[styles.percentText, { color: theme.text.tertiary }]}
      >
        {current + 1}/{total}
      </Animated.Text>
    </View>
  );
}

type DotProps = {
  isActive: boolean;
  isCompleted: boolean;
  activeColor: string;
  inactiveColor: string;
};

function Dot({ isActive, isCompleted, activeColor, inactiveColor }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, { damping: 15 }),
    backgroundColor: isActive || isCompleted ? activeColor : inactiveColor,
    opacity: withSpring(isActive ? 1 : isCompleted ? 0.7 : 0.4),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing[1],
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  percentText: {
    ...textStyles.caption,
    fontSize: 11,
  },
});
