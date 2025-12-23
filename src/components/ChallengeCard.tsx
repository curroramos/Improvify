import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { LifeCategory } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { useTheme, gradients, colors } from '@/theme';

interface ChallengeCardProps {
  id: string;
  noteId: string;
  title: string;
  description: string;
  points: number;
  category: LifeCategory;
  completed: boolean;
  createdAt: string;
  dueDate?: string | null;
  index?: number;
  onDismiss?: (id: string) => void;
}

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ChallengeCard({
  id,
  noteId,
  title,
  description,
  points,
  category,
  completed,
  createdAt,
  dueDate,
  index = 0,
  onDismiss,
}: ChallengeCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const expiration = getExpirationProgress(createdAt, dueDate);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  const getDifficultyConfig = () => {
    if (points <= 25) {
      return {
        gradient: gradients.success,
        label: 'Easy',
        icon: 'flash-on' as const,
        glow: `${colors.emerald[500]}40`,
      };
    }
    if (points <= 35) {
      return {
        gradient: gradients.warning,
        label: 'Medium',
        icon: 'local-fire-department' as const,
        glow: `${colors.amber[500]}40`,
      };
    }
    return {
      gradient: gradients.danger,
      label: 'Hard',
      icon: 'whatshot' as const,
      glow: `${colors.rose[500]}40`,
    };
  };

  const config = getDifficultyConfig();

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    shadowOpacity.value = withTiming(0.08, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/challenges/[noteId]/[challengeId]',
      params: { noteId, challengeId: id },
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(500)
        .springify()}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.cardWrapper,
          animatedStyle,
          shadowStyle,
          { shadowColor: config.gradient[0] },
        ]}
      >
        <LinearGradient
          colors={
            completed
              ? [theme.surface.secondary, theme.background.tertiary]
              : [theme.surface.primary, theme.surface.secondary]
          }
          style={styles.card}
        >
          {completed && (
            <View style={styles.completedOverlay}>
              <BlurView intensity={2} style={StyleSheet.absoluteFill} />
            </View>
          )}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient colors={config.gradient} style={styles.difficultyBadge}>
                <MaterialIcons name={config.icon} size={14} color={theme.text.inverse} />
                <Text style={[styles.difficultyText, { color: theme.text.inverse }]}>
                  {config.label}
                </Text>
              </LinearGradient>
              <CategoryBadge category={category} size="small" showIcon={true} showLabel={true} />
            </View>

            <View
              style={[styles.pointsContainer, { backgroundColor: theme.semantic.warningLight }]}
            >
              <MaterialIcons name="stars" size={16} color={colors.amber[300]} />
              <Text style={[styles.pointsText, { color: colors.amber[700] }]}>{points}</Text>
            </View>
          </View>

          <Text
            style={[
              styles.title,
              { color: theme.text.primary },
              completed && { color: theme.text.secondary },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme.text.secondary },
              completed && { color: theme.text.tertiary },
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>

          {/* Show completed badge OR expiration bar */}
          {completed ? (
            <View style={[styles.footer, { borderTopColor: theme.border.secondary }]}>
              <View style={styles.completedBadge}>
                <MaterialIcons name="check-circle" size={18} color={theme.semantic.success} />
                <Text style={[styles.completedText, { color: theme.semantic.success }]}>
                  Completed
                </Text>
              </View>
              <View
                style={[styles.arrowContainer, { backgroundColor: `${theme.brand.primary}14` }]}
              >
                <MaterialIcons name="arrow-forward" size={20} color={theme.text.tertiary} />
              </View>
            </View>
          ) : expiration ? (
            <View style={[styles.expirationContainer, { borderTopColor: theme.border.secondary }]}>
              <View style={styles.expirationRow}>
                <View style={styles.expirationBarWrapper}>
                  <View style={styles.expirationBarBg}>
                    <LinearGradient
                      colors={
                        expiration.isExpired
                          ? gradients.danger
                          : gradients.warning
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.expirationBar, { width: `${expiration.progress * 100}%` }]}
                    />
                  </View>
                </View>
                {expiration.isExpired && onDismiss && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onDismiss(id);
                    }}
                    style={[styles.dismissButton, { backgroundColor: theme.semantic.errorLight }]}
                    hitSlop={8}
                  >
                    <MaterialIcons name="close" size={16} color={theme.semantic.error} />
                  </Pressable>
                )}
              </View>
            </View>
          ) : null}
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expirationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expirationBarWrapper: {
    flex: 1,
  },
  expirationBarBg: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  expirationBar: {
    height: '100%',
    borderRadius: 2,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
