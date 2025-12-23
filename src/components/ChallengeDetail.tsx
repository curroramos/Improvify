import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { Challenge } from '@/types';
import { getDifficultyConfig } from '@/lib/domain/challenges';
import { formatFullDate } from '@/lib/utils/dateFormatting';
import { useTheme, gradients } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getExpirationProgress = (createdAt: string, dueDate?: string | null) => {
  if (!dueDate) return null;

  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const due = new Date(dueDate).getTime();

  // When expired, show full bar (progress = 1) to indicate time fully consumed
  if (now >= due) return { progress: 1, isExpired: true, hoursLeft: 0 };

  const total = due - created;
  const elapsed = now - created;
  // Progress shows how much time has ELAPSED (fills up as time passes)
  const elapsedProgress = elapsed / total;
  const hoursLeft = Math.max(0, (due - now) / (1000 * 60 * 60));

  return { progress: Math.max(0, Math.min(1, elapsedProgress)), isExpired: false, hoursLeft };
};

type Props = {
  challenge: Challenge;
  completing: boolean;
  onComplete: () => Promise<boolean>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Confetti particle component
const ConfettiParticle = ({ delay, startX }: { delay: number; startX: number }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomRotate = Math.random() * 720 - 360;

    scale.value = withDelay(delay, withSpring(1, { damping: 18 }));
    translateY.value = withDelay(
      delay,
      withTiming(400, { duration: 2000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + randomX, { duration: 2000, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(delay, withTiming(randomRotate, { duration: 2000 }));
    opacity.value = withDelay(delay + 1200, withTiming(0, { duration: 800 }));
  }, [delay, startX, translateY, translateX, rotate, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

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

// XP Popup component
const XPPopup = ({ points, onFinish }: { points: number; onFinish: () => void }) => {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 200 });
    translateY.value = withDelay(800, withTiming(-100, { duration: 600 }));
    opacity.value = withDelay(1000, withTiming(0, { duration: 400 }));

    const timeout = setTimeout(() => {
      runOnJS(onFinish)();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [scale, translateY, opacity, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.xpPopup, animatedStyle]}>
      <LinearGradient
        colors={['#FCD34D', '#F59E0B']}
        style={styles.xpPopupGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="stars" size={24} color="#FFF" />
        <Text style={styles.xpPopupText}>+{points} XP</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Success checkmark animation
const SuccessCheckmark = () => {
  const scale = useSharedValue(0);
  const circleProgress = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 150 });
    circleProgress.value = withTiming(1, { duration: 600 });
  }, [scale, circleProgress]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.successCheckmark, checkmarkStyle]}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.successCheckmarkGradient}>
        <MaterialIcons name="check" size={32} color="#FFF" />
      </LinearGradient>
    </Animated.View>
  );
};

export default function ChallengeDetail({ challenge, completing, onComplete }: Props) {
  const { theme, gradients: themeGradients } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonRotate = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const _checkmarkScale = useSharedValue(0); // Reserved for animation
  const cardGlow = useSharedValue(0);
  const spinnerRotate = useSharedValue(0);

  const config = getDifficultyConfig(challenge.points);
  const expiration = getExpirationProgress(challenge.created_at, challenge.due_date);

  // Spinner animation for completing state
  useEffect(() => {
    if (completing) {
      spinnerRotate.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(720, { duration: 1000 })
      );
    } else {
      spinnerRotate.value = 0;
    }
  }, [completing, spinnerRotate]);

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotate.value}deg` }],
  }));

  // Handle completion animation
  useEffect(() => {
    if (challenge.completed && justCompleted) {
      // Trigger celebration
      setShowCelebration(true);
      setShowXPPopup(true);

      // Card glow effect
      cardGlow.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 1000 })
      );

      // Haptic celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset celebration after animation
      const timeout = setTimeout(() => {
        setShowCelebration(false);
        setJustCompleted(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [challenge.completed, justCompleted, cardGlow]);

  const handlePressIn = useCallback(() => {
    if (!completing && !challenge.completed) {
      buttonScale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [completing, challenge.completed, buttonScale]);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [buttonScale]);

  const handlePress = useCallback(async () => {
    if (!completing && !challenge.completed) {
      // Start progress animation
      progressWidth.value = withTiming(100, { duration: 300 });

      // Button shake for feedback
      buttonRotate.value = withSequence(
        withTiming(-2, { duration: 50 }),
        withTiming(2, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      try {
        // Wait for completion to succeed before showing celebration
        const success = await onComplete();
        if (success) {
          setJustCompleted(true);
        } else {
          // Reset progress animation on failure
          progressWidth.value = withTiming(0, { duration: 200 });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch {
        // Handle promise rejection
        progressWidth.value = withTiming(0, { duration: 200 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [completing, challenge.completed, progressWidth, buttonRotate, onComplete]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }, { rotate: `${buttonRotate.value}deg` }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const cardGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(cardGlow.value, [0, 1], [0.08, 0.4], Extrapolation.CLAMP),
    shadowRadius: interpolate(cardGlow.value, [0, 1], [24, 40], Extrapolation.CLAMP),
  }));

  // Generate confetti particles
  const confettiParticles = showCelebration
    ? Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 300,
        startX: SCREEN_WIDTH / 2 - 16,
      }))
    : [];

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: theme.background.primary }]} showsVerticalScrollIndicator={false}>
      {/* Confetti overlay */}
      {showCelebration && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiParticles.map((particle) => (
            <ConfettiParticle key={particle.id} delay={particle.delay} startX={particle.startX} />
          ))}
        </View>
      )}

      {/* XP Popup */}
      {showXPPopup && <XPPopup points={challenge.points} onFinish={() => setShowXPPopup(false)} />}

      <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
        <Animated.View style={cardGlowStyle}>
          <LinearGradient colors={[theme.surface.primary, theme.surface.secondary]} style={[styles.card, { shadowColor: theme.brand.primary }]}>
            <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
              <LinearGradient colors={config.gradient} style={styles.difficultyBadge}>
                <MaterialIcons name={config.icon} size={16} color={theme.text.inverse} />
                <Text style={[styles.difficultyText, { color: theme.text.inverse }]}>{config.label}</Text>
              </LinearGradient>

              <View style={[styles.pointsBadge, { backgroundColor: theme.semantic.warningLight }]}>
                <MaterialIcons name="stars" size={18} color={theme.semantic.warning} />
                <Text style={[styles.pointsText, { color: theme.semantic.warning }]}>{challenge.points} XP</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <Text style={[styles.title, { color: theme.text.primary }]}>{challenge.title}</Text>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(300).duration(400)}
              style={[styles.descriptionContainer, { backgroundColor: theme.background.secondary }]}
            >
              <Text style={[styles.description, { color: theme.text.secondary }]}>{challenge.description}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.metaSection}>
              <View style={[styles.metaCard, { backgroundColor: theme.surface.primary, borderColor: theme.border.secondary }]}>
                <View style={[styles.metaIconContainer, { backgroundColor: config.bgColor }]}>
                  <MaterialIcons name="assignment" size={20} color={config.gradient[0]} />
                </View>
                <View>
                  <Text style={[styles.metaLabel, { color: theme.text.tertiary }]}>Status</Text>
                  <View style={styles.statusRow}>
                    {challenge.completed ? (
                      <>
                        <MaterialIcons name="check-circle" size={16} color={theme.semantic.success} />
                        <Text style={[styles.metaValue, { color: theme.semantic.success }]}>Completed</Text>
                      </>
                    ) : (
                      <>
                        <View style={[styles.pendingDot, { backgroundColor: theme.brand.primary }]} />
                        <Text style={[styles.metaValue, { color: theme.brand.primary }]}>In Progress</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {challenge.created_at && (
                <View style={[styles.metaCard, { backgroundColor: theme.surface.primary, borderColor: theme.border.secondary }]}>
                  <View style={[styles.metaIconContainer, { backgroundColor: `${theme.brand.primary}14` }]}>
                    <MaterialIcons name="event" size={20} color={theme.brand.primary} />
                  </View>
                  <View>
                    <Text style={[styles.metaLabel, { color: theme.text.tertiary }]}>Created</Text>
                    <Text style={[styles.metaValue, { color: theme.text.primary }]}>{formatFullDate(challenge.created_at)}</Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Expiration progress bar */}
            {expiration && !challenge.completed && (
              <Animated.View
                entering={FadeInUp.delay(450).duration(400)}
                style={[
                  styles.expirationSection,
                  { backgroundColor: theme.surface.primary, borderColor: theme.border.secondary },
                  expiration.isExpired && { backgroundColor: theme.semantic.errorLight, borderColor: `${theme.semantic.error}33` },
                ]}
              >
                <View style={styles.expirationHeader}>
                  <View
                    style={[
                      styles.expirationIconContainer,
                      { backgroundColor: `${theme.brand.primary}1A` },
                      expiration.isExpired && { backgroundColor: theme.semantic.error },
                      !expiration.isExpired &&
                        expiration.hoursLeft < 2 && { backgroundColor: `${theme.semantic.error}1A` },
                      !expiration.isExpired &&
                        expiration.hoursLeft < 24 &&
                        expiration.hoursLeft >= 2 && { backgroundColor: `${theme.semantic.warning}1A` },
                    ]}
                  >
                    <MaterialIcons
                      name={
                        expiration.isExpired
                          ? 'error'
                          : expiration.hoursLeft < 2
                            ? 'warning'
                            : 'schedule'
                      }
                      size={18}
                      color={
                        expiration.isExpired
                          ? theme.text.inverse
                          : expiration.hoursLeft < 2
                            ? theme.semantic.error
                            : expiration.hoursLeft < 24
                              ? theme.semantic.warning
                              : theme.brand.primary
                      }
                    />
                  </View>
                  <View style={styles.expirationTextContainer}>
                    <Text
                      style={[
                        styles.expirationTitle,
                        { color: theme.text.primary },
                        expiration.isExpired && { color: theme.semantic.error },
                        !expiration.isExpired &&
                          expiration.hoursLeft < 2 && { color: theme.semantic.error },
                        !expiration.isExpired &&
                          expiration.hoursLeft < 24 &&
                          expiration.hoursLeft >= 2 && { color: theme.semantic.warning },
                      ]}
                    >
                      {expiration.isExpired ? 'CHALLENGE EXPIRED' : 'Time Remaining'}
                    </Text>
                    <Text
                      style={[
                        styles.expirationLabel,
                        { color: theme.text.secondary },
                        expiration.isExpired && { color: theme.semantic.error },
                        !expiration.isExpired &&
                          expiration.hoursLeft < 2 && { color: theme.semantic.error },
                      ]}
                    >
                      {expiration.isExpired
                        ? 'This challenge is no longer available'
                        : expiration.hoursLeft < 1
                          ? `${Math.round(expiration.hoursLeft * 60)} minutes left`
                          : expiration.hoursLeft < 24
                            ? `${Math.round(expiration.hoursLeft)} hours left`
                            : `${Math.round(expiration.hoursLeft / 24)} days left`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.expirationBarBg, { backgroundColor: theme.background.tertiary }]}>
                  <LinearGradient
                    colors={
                      expiration.isExpired || expiration.hoursLeft < 2
                        ? themeGradients.danger
                        : themeGradients.warning
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.expirationBar, { width: `${expiration.progress * 100}%` }]}
                  />
                </View>
              </Animated.View>
            )}

            {challenge.completed && (
              <Animated.View entering={ZoomIn.duration(300)} style={styles.completedBanner}>
                <LinearGradient
                  colors={[`${theme.semantic.success}26`, `${theme.semantic.success}0D`]}
                  style={styles.completedBannerGradient}
                >
                  <View style={[styles.completedBannerIcon, { backgroundColor: `${theme.semantic.success}26` }]}>
                    <MaterialIcons name="emoji-events" size={32} color={theme.semantic.success} />
                  </View>
                  <View style={styles.completedBannerText}>
                    <Text style={[styles.completedBannerTitle, { color: theme.semantic.success }]}>Challenge Complete!</Text>
                    <Text style={[styles.completedBannerSubtitle, { color: theme.semantic.success }]}>
                      You earned {challenge.points} XP
                    </Text>
                  </View>
                  {justCompleted && <SuccessCheckmark />}
                </LinearGradient>
              </Animated.View>
            )}

            {!challenge.completed && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                style={styles.actionSection}
              >
                <AnimatedPressable
                  onPress={handlePress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={completing}
                  style={[styles.buttonWrapper, buttonAnimatedStyle, { shadowColor: theme.brand.primary }]}
                >
                  <LinearGradient
                    colors={completing ? [theme.text.tertiary, theme.text.tertiary] : themeGradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {/* Progress overlay */}
                    {completing && (
                      <Animated.View style={[styles.progressOverlay, progressAnimatedStyle]}>
                        <LinearGradient
                          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>
                    )}

                    {completing ? (
                      <Animated.View entering={FadeIn.duration(200)} style={styles.buttonContent}>
                        <Animated.View style={spinnerAnimatedStyle}>
                          <MaterialIcons name="hourglass-empty" size={22} color={theme.text.inverse} />
                        </Animated.View>
                        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Completing...</Text>
                      </Animated.View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <MaterialIcons name="check-circle" size={22} color={theme.text.inverse} />
                        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Mark as Completed</Text>
                      </View>
                    )}
                  </LinearGradient>
                </AnimatedPressable>

                <Text style={[styles.hintText, { color: theme.text.tertiary }]}>
                  Complete this challenge to earn {challenge.points} XP
                </Text>
              </Animated.View>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  xpPopup: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 101,
  },
  xpPopupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  xpPopupText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  successCheckmark: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -24,
  },
  successCheckmarkGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 16,
  },
  descriptionContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
  metaSection: {
    gap: 12,
    marginBottom: 24,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  metaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  completedBanner: {
    marginBottom: 20,
  },
  completedBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 70,
    borderRadius: 16,
    gap: 14,
    position: 'relative',
  },
  completedBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBannerText: {
    flex: 1,
  },
  completedBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  completedBannerSubtitle: {
    fontSize: 14,
  },
  actionSection: {
    gap: 12,
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 4,
  },
  expirationSection: {
    marginBottom: 24,
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  expirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  expirationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expirationTextContainer: {
    flex: 1,
  },
  expirationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  expirationLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  expirationBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  expirationBar: {
    height: '100%',
    borderRadius: 4,
  },
});
