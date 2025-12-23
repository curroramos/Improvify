import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
  const { t } = useTranslation('notes');
  const { theme, gradients } = useTheme();

  const displayTitle = title ?? t('emptyState.title');
  const displaySubtitle = subtitle ?? t('emptyState.subtitle');
  const displayActionLabel = actionLabel ?? t('emptyState.action');
  const floatY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAction?.();
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.illustrationContainer}>
        <Animated.View style={floatingStyle}>
          <LinearGradient
            colors={gradients.primary}
            style={[styles.iconContainer, { shadowColor: theme.brand.primary }]}
          >
            <MaterialIcons name="auto-stories" size={36} color={theme.text.inverse} />
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{displayTitle}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{displaySubtitle}</Text>
      </Animated.View>

      {onAction && (
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={buttonAnimatedStyle}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.button, { shadowColor: theme.brand.primary }]}
              >
                <MaterialIcons name="add" size={20} color={theme.text.inverse} />
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
                  {displayActionLabel}
                </Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmptyState;
