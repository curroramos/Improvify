import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { FireStateConfig, StreakDangerStatus } from '@/lib/domain/streak';
import { useTheme, spacing, textStyles } from '@/theme';

interface StreakFireProps {
  streakDays: number;
  fireState: FireStateConfig;
  dangerStatus?: StreakDangerStatus;
  shieldCount?: number;
  isShieldActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showShields?: boolean;
  onPress?: () => void;
}

const SIZE_CONFIG = {
  small: { icon: 20, text: 14, container: 40 },
  medium: { icon: 28, text: 18, container: 56 },
  large: { icon: 40, text: 24, container: 80 },
};

export function StreakFire({
  streakDays,
  fireState,
  dangerStatus,
  shieldCount = 0,
  isShieldActive = false,
  size = 'medium',
  showLabel = false,
  showShields = false,
  onPress,
}: StreakFireProps) {
  const { theme } = useTheme();
  const sizeConfig = SIZE_CONFIG[size];

  // Animation values
  const flickerScale = useSharedValue(1);
  const flickerRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const _pulseScale = useSharedValue(1); // Reserved for future use
  const dangerPulse = useSharedValue(1);

  // Set up animations based on fire state
  useEffect(() => {
    if (fireState.state === 'dead') {
      // No animation for dead state
      flickerScale.value = 1;
      flickerRotation.value = 0;
      glowOpacity.value = 0;
      return;
    }

    // Flicker animation - intensity based on fire state
    const flickerIntensity = 0.05 + fireState.intensity * 0.1;
    flickerScale.value = withRepeat(
      withSequence(
        withTiming(1 + flickerIntensity, { duration: 150, easing: Easing.ease }),
        withTiming(1 - flickerIntensity * 0.5, { duration: 100, easing: Easing.ease }),
        withTiming(1, { duration: 150, easing: Easing.ease })
      ),
      -1,
      true
    );

    // Rotation flicker
    const rotationIntensity = 2 + fireState.intensity * 3;
    flickerRotation.value = withRepeat(
      withSequence(
        withTiming(rotationIntensity, { duration: 200, easing: Easing.ease }),
        withTiming(-rotationIntensity, { duration: 200, easing: Easing.ease })
      ),
      -1,
      true
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3 + fireState.intensity * 0.4, { duration: 1000 }),
        withTiming(0.1 + fireState.intensity * 0.2, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [fireState]);

  // Danger pulse animation
  useEffect(() => {
    if (dangerStatus?.level === 'danger') {
      dangerPulse.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 300 }), withTiming(1, { duration: 300 })),
        -1,
        true
      );
    } else if (dangerStatus?.level === 'warning') {
      dangerPulse.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    } else {
      dangerPulse.value = withSpring(1);
    }
  }, [dangerStatus?.level]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flickerScale.value * dangerPulse.value },
      { rotate: `${flickerRotation.value}deg` },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.5 + flickerScale.value * 0.2 }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const isDanger = dangerStatus?.level === 'danger' || dangerStatus?.level === 'warning';

  return (
    <Pressable onPress={onPress ? handlePress : undefined} disabled={!onPress}>
      <View style={styles.container}>
        {/* Glow effect */}
        {fireState.state !== 'dead' && (
          <Animated.View
            style={[
              styles.glow,
              {
                width: sizeConfig.container * 1.5,
                height: sizeConfig.container * 1.5,
                backgroundColor: fireState.glowColor,
                borderRadius: sizeConfig.container,
              },
              animatedGlowStyle,
            ]}
          />
        )}

        {/* Fire icon */}
        <Animated.View style={animatedIconStyle}>
          <MaterialIcons
            name="local-fire-department"
            size={sizeConfig.icon}
            color={isDanger ? theme.semantic.error : fireState.color}
          />
        </Animated.View>

        {/* Streak count */}
        <Text
          style={[
            styles.streakCount,
            {
              fontSize: sizeConfig.text,
              color: isDanger ? theme.semantic.error : theme.text.primary,
            },
          ]}
        >
          {streakDays}
        </Text>

        {/* Shield indicator */}
        {showShields && shieldCount > 0 && (
          <View style={[styles.shieldBadge, { backgroundColor: theme.brand.primary }]}>
            <MaterialIcons name="shield" size={12} color="#FFFFFF" />
            <Text style={styles.shieldCount}>{shieldCount}</Text>
          </View>
        )}

        {/* Active shield indicator */}
        {isShieldActive && (
          <View style={[styles.activeShield, { borderColor: theme.brand.primary }]}>
            <MaterialIcons name="verified-user" size={14} color={theme.brand.primary} />
          </View>
        )}

        {/* Label */}
        {showLabel && (
          <Text style={[styles.label, { color: theme.text.secondary }]}>{fireState.label}</Text>
        )}
      </View>
    </Pressable>
  );
}

// Compact inline version for headers
interface StreakFireInlineProps {
  streakDays: number;
  fireState: FireStateConfig;
  onPress?: () => void;
}

export function StreakFireInline({ streakDays, fireState, onPress }: StreakFireInlineProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={onPress ? handlePress : undefined}
      style={[styles.inlineContainer, { backgroundColor: theme.surface.secondary }]}
    >
      <MaterialIcons
        name="local-fire-department"
        size={16}
        color={fireState.state === 'dead' ? theme.text.tertiary : fireState.color}
      />
      <Text style={[styles.inlineCount, { color: theme.text.primary }]}>{streakDays}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
  },
  streakCount: {
    fontWeight: '700',
    marginTop: spacing[1],
  },
  label: {
    ...textStyles.caption,
    marginTop: spacing[1],
  },
  shieldBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  shieldCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeShield: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 2,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 12,
    gap: spacing[1],
  },
  inlineCount: {
    ...textStyles.bodySmall,
    fontWeight: '600',
  },
});
