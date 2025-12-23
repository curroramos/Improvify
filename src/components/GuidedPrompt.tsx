import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Dimensions, TextInput as TextInputType } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, spacing, radius, textStyles } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type GuidedPromptProps = {
  emoji: string;
  question: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  index: number;
  isActive?: boolean;
};

export function GuidedPrompt({
  emoji,
  question,
  value,
  onChangeText,
  placeholder = 'Type your answer...',
  index,
  isActive = false,
}: GuidedPromptProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInputType>(null);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  const opacity = useSharedValue(isActive ? 1 : 0.7);

  // Animate when becoming active
  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.95, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(isActive ? 1 : 0.7, { duration: 200 });

    // Focus input when becoming active (with delay for animation)
    if (isActive && index > 0) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, index, scale, opacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={[styles.content, animatedContainerStyle]}
      >
        <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.emoji}>
          {emoji}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.question, { color: theme.text.primary }]}
        >
          {question}
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.surface.primary,
              borderColor: isActive ? theme.brand.primary : theme.border.primary,
              borderWidth: isActive ? 2 : 1,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text.primary }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.text.tertiary}
            multiline
            textAlignVertical="top"
            autoFocus={index === 0}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing[20],
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  question: {
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  inputContainer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 120,
    maxHeight: 200,
  },
  input: {
    ...textStyles.body,
    padding: spacing[4],
    flex: 1,
  },
});
