import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme, spacing, radius, textStyles, colors } from '@/theme';

// Animated sparkle component for generating stage
function GeneratingAnimation() {
  const mainRotation = useSharedValue(0);
  const mainScale = useSharedValue(1);
  const sparkle1Opacity = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0);
  const sparkle1Position = useSharedValue(0);
  const sparkle2Position = useSharedValue(0);
  const sparkle3Position = useSharedValue(0);

  useEffect(() => {
    // Main icon pulse
    mainScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Main icon gentle rotation
    mainRotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Floating sparkles with staggered timing
    const animateSparkle = (
      opacity: ReturnType<typeof useSharedValue<number>>,
      position: ReturnType<typeof useSharedValue<number>>,
      delay: number
    ) => {
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1
        )
      );
      position.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(8, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    };

    animateSparkle(sparkle1Opacity, sparkle1Position, 0);
    animateSparkle(sparkle2Opacity, sparkle2Position, 300);
    animateSparkle(sparkle3Opacity, sparkle3Position, 600);
  }, []);

  const mainAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }, { rotate: `${mainRotation.value}deg` }],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
    transform: [{ translateY: sparkle1Position.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
    transform: [{ translateX: sparkle2Position.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3Opacity.value,
    transform: [{ translateY: -sparkle3Position.value }],
  }));

  return (
    <View style={animStyles.container}>
      {/* Floating mini sparkles */}
      <Animated.View style={[animStyles.miniSparkle, animStyles.sparkle1, sparkle1Style]}>
        <MaterialIcons name="auto-awesome" size={16} color={colors.violet[400]} />
      </Animated.View>
      <Animated.View style={[animStyles.miniSparkle, animStyles.sparkle2, sparkle2Style]}>
        <MaterialIcons name="auto-awesome" size={14} color={colors.amber[400]} />
      </Animated.View>
      <Animated.View style={[animStyles.miniSparkle, animStyles.sparkle3, sparkle3Style]}>
        <MaterialIcons name="auto-awesome" size={12} color={colors.indigo[400]} />
      </Animated.View>

      {/* Main sparkle icon */}
      <Animated.View style={mainAnimatedStyle}>
        <MaterialIcons name="auto-awesome" size={48} color={colors.amber[500]} />
      </Animated.View>
    </View>
  );
}

const animStyles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 0,
    right: 8,
  },
  sparkle2: {
    bottom: 8,
    left: 0,
  },
  sparkle3: {
    top: 12,
    left: 4,
  },
});

export type SaveStage = 'saving' | 'generating' | 'done' | null;

type SaveProgressModalProps = {
  visible: boolean;
  stage: SaveStage;
  onDone?: () => void;
};

const GENERATING_MESSAGE_KEYS = [
  'notes:generating.messages.analyzing',
  'notes:generating.messages.finding',
  'notes:generating.messages.crafting',
  'notes:generating.messages.almostDone',
];

export function SaveProgressModal({ visible, stage, onDone }: SaveProgressModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('notes');
  const checkScale = useSharedValue(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Stage config with translations
  const getStageConfig = (currentStage: SaveStage) => {
    switch (currentStage) {
      case 'saving':
        return { title: t('saving.title'), subtitle: t('saving.subtitle') };
      case 'generating':
        return { title: t('generating.title'), subtitle: t('generating.subtitle') };
      case 'done':
        return { title: t('done.title'), subtitle: t('done.subtitle') };
      default:
        return { title: '', subtitle: '' };
    }
  };

  // Cycle through generating messages
  useEffect(() => {
    if (stage === 'generating') {
      setMessageIndex(0);
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % GENERATING_MESSAGE_KEYS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'done') {
      checkScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const timer = setTimeout(() => {
        onDone?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!visible || !stage) return null;

  const config = getStageConfig(stage);

  // Get the current generating message
  const getGeneratingMessage = () => {
    const key = GENERATING_MESSAGE_KEYS[messageIndex];
    return t(key.replace('notes:', ''));
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.container, { backgroundColor: theme.surface.primary }]}
        >
          <View style={styles.iconContainer}>
            {stage === 'saving' && <ActivityIndicator size="large" color={theme.brand.primary} />}
            {stage === 'generating' && (
              <Animated.View entering={FadeIn.duration(300)}>
                <GeneratingAnimation />
              </Animated.View>
            )}
            {stage === 'done' && (
              <Animated.View style={checkAnimatedStyle}>
                <MaterialIcons name="check-circle" size={64} color={colors.emerald[500]} />
              </Animated.View>
            )}
          </View>

          <Text style={[styles.title, { color: theme.text.primary }]}>{config.title}</Text>
          <Animated.Text
            key={stage === 'generating' ? messageIndex : 'static'}
            entering={FadeIn.duration(300)}
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            {stage === 'generating' ? getGeneratingMessage() : config.subtitle}
          </Animated.Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  container: {
    width: '100%',
    maxWidth: 300,
    borderRadius: radius['2xl'],
    padding: spacing[8],
    alignItems: 'center',
  },
  iconContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h4,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
});
