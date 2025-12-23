import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { MilestoneConfig } from '@/lib/domain/streak';
import { useTheme, spacing, radius, textStyles } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MilestoneCelebrationProps {
  visible: boolean;
  milestone: MilestoneConfig | null;
  onClaim: () => void;
  onClose: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;

    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, { duration: 3000 + Math.random() * 2000 })
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(targetX * 0.3, { duration: 500 }),
        withTiming(targetX, { duration: 2500 })
      )
    );
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1000 }), -1));
    opacity.value = withDelay(delay + 2000, withTiming(0, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { width: size, height: size, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export function MilestoneCelebration({
  visible,
  milestone,
  onClaim,
  onClose,
}: MilestoneCelebrationProps) {
  const { theme } = useTheme();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descOpacity = useSharedValue(0);
  const rewardScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const starRotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in sequence
      backdropOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
      cardOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      emojiScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 150 }));
      titleOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
      descOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));
      rewardScale.value = withDelay(900, withSpring(1, { damping: 10, stiffness: 120 }));
      buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 300 }));

      // Continuous star rotation
      starRotation.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1
      );
    } else {
      // Reset animations
      backdropOpacity.value = 0;
      cardScale.value = 0.5;
      cardOpacity.value = 0;
      emojiScale.value = 0;
      titleOpacity.value = 0;
      descOpacity.value = 0;
      rewardScale.value = 0;
      buttonOpacity.value = 0;
    }
  }, [visible]);

  const handleClaim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate out
    backdropOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.8, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      onClaim();
    }, 200);
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));

  const rewardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  if (!milestone) return null;

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 500,
    startX: SCREEN_WIDTH / 2 - 25 + Math.random() * 50,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        {/* Confetti */}
        {visible &&
          confettiParticles.map((particle) => (
            <ConfettiParticle key={particle.id} delay={particle.delay} startX={particle.startX} />
          ))}

        {/* Card */}
        <Animated.View style={[styles.card, { backgroundColor: theme.surface.primary }, cardStyle]}>
          {/* Decorative stars background */}
          <Animated.View style={[styles.starsContainer, starStyle]}>
            {[...Array(8)].map((_, i) => (
              <MaterialIcons
                key={i}
                name="star"
                size={24}
                color={theme.semantic.warning}
                style={[
                  styles.star,
                  {
                    transform: [{ rotate: `${i * 45}deg` }, { translateY: -80 }],
                    opacity: 0.3,
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Emoji */}
          <Animated.View style={[styles.emojiContainer, emojiStyle]}>
            <Text style={styles.emoji}>{milestone.emoji}</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[styles.title, { color: theme.text.primary }, titleStyle]}>
            {milestone.title}
          </Animated.Text>

          {/* Days badge */}
          <Animated.View style={titleStyle}>
            <LinearGradient
              colors={[theme.brand.primary, theme.brand.secondary || theme.brand.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.daysBadge}
            >
              <Text style={styles.daysText}>{milestone.days} Day Streak!</Text>
            </LinearGradient>
          </Animated.View>

          {/* Description */}
          <Animated.Text style={[styles.description, { color: theme.text.secondary }, descStyle]}>
            {milestone.description}
          </Animated.Text>

          {/* Reward */}
          {milestone.reward && (
            <Animated.View
              style={[
                styles.rewardContainer,
                { backgroundColor: theme.surface.secondary },
                rewardStyle,
              ]}
            >
              <Text style={[styles.rewardLabel, { color: theme.text.secondary }]}>Reward</Text>
              <View style={styles.rewardContent}>
                <MaterialIcons
                  name={milestone.reward.type === 'gems' ? 'diamond' : 'shield'}
                  size={28}
                  color={milestone.reward.type === 'gems' ? '#60A5FA' : theme.brand.primary}
                />
                <Text style={[styles.rewardAmount, { color: theme.text.primary }]}>
                  +{milestone.reward.amount} {milestone.reward.type === 'gems' ? 'Gems' : 'Shield'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Claim button */}
          <Animated.View style={[styles.buttonContainer, buttonStyle]}>
            <Pressable onPress={handleClaim}>
              <LinearGradient
                colors={[theme.brand.primary, theme.brand.secondary || theme.brand.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.claimButton}
              >
                <Text style={styles.claimButtonText}>Claim Reward</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    borderRadius: radius['2xl'],
    padding: spacing[6],
    alignItems: 'center',
    overflow: 'hidden',
  },
  starsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
  },
  star: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  daysBadge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    marginBottom: spacing[3],
  },
  daysText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[2],
  },
  rewardContainer: {
    width: '100%',
    padding: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  rewardLabel: {
    ...textStyles.caption,
    marginBottom: spacing[2],
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rewardAmount: {
    ...textStyles.h4,
  },
  buttonContainer: {
    width: '100%',
  },
  claimButton: {
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
