import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { getLevelProgressData } from '@/lib/domain/leveling';
import LevelUpCelebration from './LevelUpCelebration';
import { useTheme } from '@/theme';

type UserLevelBarProps = {
  points: number;
  onPress?: () => void;
};

export default function UserLevelBar({ points, onPress }: UserLevelBarProps) {
  const { theme, gradients } = useTheme();
  const pressScale = useSharedValue(1);
  const previousLevelRef = useRef<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState(1);

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const { level, title, currentLevelPoints, nextLevelPoints, progress, pointsToNext } =
    getLevelProgressData(points);

  // Detect level up
  useEffect(() => {
    if (previousLevelRef.current !== null && level > previousLevelRef.current) {
      setCelebrationLevel(level);
      setShowLevelUp(true);
    }
    previousLevelRef.current = level;
  }, [level]);

  const progressWidth = useDerivedValue(() =>
    withDelay(300, withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) }))
  );

  const glowOpacity = useDerivedValue(() => withDelay(800, withTiming(0.6, { duration: 500 })));

  const badgeScale = useDerivedValue(() =>
    withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }))
  );

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      pressScale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const content = (
    <LinearGradient
      colors={[theme.surface.primary, theme.surface.secondary]}
      style={[styles.card, { shadowColor: theme.brand.primary }]}
    >
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
        <View style={styles.levelInfo}>
          <Animated.View
            style={[styles.levelBadge, badgeAnimatedStyle, { shadowColor: theme.brand.primary }]}
          >
            <LinearGradient colors={gradients.primary} style={styles.levelGradient}>
              <MaterialIcons name="workspace-premium" size={20} color={theme.text.inverse} />
              <Text style={[styles.levelNumber, { color: theme.text.inverse }]}>{level}</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.levelTextContainer}>
            <Text style={[styles.levelTitle, { color: theme.text.primary }]}>{title}</Text>
            <Text style={[styles.levelSubtitle, { color: theme.text.tertiary }]}>
              Level {level}
            </Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.pointsDisplay}>
            <Text style={[styles.totalPoints, { color: theme.text.primary }]}>
              {points.toLocaleString()}
            </Text>
            <Text style={[styles.pointsLabel, { color: theme.text.tertiary }]}>total XP</Text>
          </View>
          {onPress && (
            <View style={styles.chevronContainer}>
              <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressCurrent, { color: theme.brand.primary }]}>
            {currentLevelPoints.toLocaleString()} XP
          </Text>
          {nextLevelPoints > 0 && (
            <Text style={[styles.progressTarget, { color: theme.text.tertiary }]}>
              {nextLevelPoints.toLocaleString()} XP
            </Text>
          )}
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.background.tertiary }]}>
          <Animated.View
            style={[
              styles.progressGlow,
              glowAnimatedStyle,
              { backgroundColor: `${theme.brand.primary}1A` },
            ]}
          />
          <Animated.View style={[styles.progressBar, progressAnimatedStyle]}>
            <LinearGradient
              colors={gradients.primaryExtended}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>

          <View style={[styles.milestone, styles.milestone25]}>
            <View style={[styles.milestoneInner, progress >= 25 && styles.milestoneActive]} />
          </View>
          <View style={[styles.milestone, styles.milestone50]}>
            <View style={[styles.milestoneInner, progress >= 50 && styles.milestoneActive]} />
          </View>
          <View style={[styles.milestone, styles.milestone75]}>
            <View style={[styles.milestoneInner, progress >= 75 && styles.milestoneActive]} />
          </View>
        </View>

        {pointsToNext > 0 && (
          <View style={[styles.nextLevelInfo, { backgroundColor: `${theme.semantic.success}14` }]}>
            <MaterialIcons name="trending-up" size={14} color={theme.semantic.success} />
            <Text style={[styles.nextLevelText, { color: theme.semantic.success }]}>
              {pointsToNext.toLocaleString()} XP to Level {level + 1}
            </Text>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );

  return (
    <>
      <Animated.View entering={FadeIn.duration(500)} style={[styles.container, pressAnimatedStyle]}>
        {onPress ? (
          <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            {content}
          </Pressable>
        ) : (
          content
        )}
      </Animated.View>

      <LevelUpCelebration
        visible={showLevelUp}
        newLevel={celebrationLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
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
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  levelGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  levelNumber: {
    fontWeight: '800',
    fontSize: 18,
  },
  levelTextContainer: {
    gap: 2,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  levelSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsDisplay: {
    alignItems: 'flex-end',
  },
  chevronContainer: {
    marginLeft: 4,
  },
  totalPoints: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    marginBottom: 0,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCurrent: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTarget: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  milestone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    marginLeft: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  milestoneActive: {
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  nextLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  nextLevelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  milestone25: {
    left: '25%',
  },
  milestone50: {
    left: '50%',
  },
  milestone75: {
    left: '75%',
  },
});
