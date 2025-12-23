import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { getLevelTitle } from '@/lib/domain/leveling';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible: boolean;
  newLevel: number;
  onClose: () => void;
};

// Confetti particle component
const ConfettiParticle = ({
  delay,
  startX,
  startY,
}: {
  delay: number;
  startX: number;
  startY: number;
}) => {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 300;
    const randomRotate = Math.random() * 720 - 360;

    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    translateY.value = withDelay(
      delay,
      withTiming(startY + 500, { duration: 2500, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + randomX, { duration: 2500, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(delay, withTiming(randomRotate, { duration: 2500 }));
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 700 }));
  }, [delay, startX, startY, translateY, translateX, rotate, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#FCD34D'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 10 + Math.random() * 10;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// Star burst component
const StarBurst = ({ delay }: { delay: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.5, { damping: 8, stiffness: 100 }),
        withTiming(2, { duration: 500 }),
        withTiming(0, { duration: 300 })
      )
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(600, withTiming(0, { duration: 300 }))
      )
    );
    rotate.value = withDelay(delay, withTiming(180, { duration: 1000 }));
  }, [delay, scale, opacity, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.starBurst, animatedStyle]}>
      <MaterialIcons name="auto-awesome" size={40} color="#FCD34D" />
    </Animated.View>
  );
};

export default function LevelUpCelebration({ visible, newLevel, onClose }: Props) {
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(-15);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Badge animation
      badgeScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
      badgeRotate.value = withDelay(
        300,
        withSequence(
          withSpring(10, { damping: 4 }),
          withSpring(-5, { damping: 6 }),
          withSpring(0, { damping: 10 })
        )
      );

      // Title animation
      titleOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
      titleTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));

      // Shimmer effect
      shimmer.value = withDelay(800, withRepeat(withTiming(1, { duration: 1500 }), -1, true));

      // Auto close after animation
      const timeout = setTimeout(() => {
        runOnJS(onClose)();
      }, 3500);

      return () => clearTimeout(timeout);
    } else {
      // Reset values
      badgeScale.value = 0;
      badgeRotate.value = -15;
      titleOpacity.value = 0;
      titleTranslateY.value = 30;
      shimmer.value = 0;
    }
  }, [visible, badgeScale, badgeRotate, titleOpacity, titleTranslateY, shimmer, onClose]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }, { rotate: `${badgeRotate.value}deg` }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  // Generate confetti particles
  const confettiParticles = visible
    ? Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 500,
        startX: SCREEN_WIDTH / 2 - 10,
        startY: SCREEN_HEIGHT / 3,
      }))
    : [];

  // Generate star bursts
  const starBursts = visible
    ? Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delay: 200 + i * 100,
      }))
    : [];

  const levelTitle = getLevelTitle(newLevel);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiParticles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              delay={particle.delay}
              startX={particle.startX}
              startY={particle.startY}
            />
          ))}
        </View>

        {/* Star bursts */}
        {starBursts.map((star) => (
          <StarBurst key={star.id} delay={star.delay} />
        ))}

        {/* Main content */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
          {/* Level badge */}
          <Animated.View style={[styles.badgeContainer, badgeAnimatedStyle]}>
            <LinearGradient colors={['#6366F1', '#8B5CF6', '#A78BFA']} style={styles.badge}>
              <View style={styles.badgeInner}>
                <MaterialIcons name="workspace-premium" size={48} color="#FFF" />
                <Text style={styles.levelNumber}>{newLevel}</Text>
              </View>
            </LinearGradient>
            <View style={styles.badgeGlow} />
          </Animated.View>

          {/* Text content */}
          <Animated.View style={[styles.textContainer, titleAnimatedStyle]}>
            <Text style={styles.levelUpText}>LEVEL UP!</Text>
            <Text style={styles.newLevelText}>Level {newLevel}</Text>
            <Text style={styles.titleText}>{levelTitle}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  starBurst: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    marginBottom: 32,
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  badgeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    top: -20,
    left: -20,
    zIndex: -1,
  },
  levelNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    marginTop: -4,
  },
  textContainer: {
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 4,
    marginBottom: 8,
  },
  newLevelText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#A78BFA',
    letterSpacing: 0.5,
  },
});
