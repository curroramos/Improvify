import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Keyboard,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { generateChallenges } from '@/services/aiService';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentLanguage } from '@/i18n';
import {
  useCreateNote,
  useUpdateNote,
  useCreateChallenges,
  useMarkChallengesGenerated,
  useTodaysNote,
  useUserPreferences,
} from '@/lib/query';
import { useDraftStore } from '@/lib/store/useDraftStore';
import { usePromptsStore, Prompt } from '@/lib/store/usePromptsStore';
import { useTheme, spacing, radius, textStyles } from '@/theme';
import type { ThemeId } from '@/config/themes';

import { GuidedPrompt } from '@/components/GuidedPrompt';
import { PromptProgress } from '@/components/PromptProgress';
import { SaveProgressModal, SaveStage } from '@/components/SaveProgressModal';
import { logger } from '@/lib/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getFormattedDate = (locale: string) => {
  const today = new Date();
  return today.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Parse saved HTML content back to answers object
const parseContentToAnswers = (content: string, prompts: Prompt[]): Record<number, string> => {
  const answers: Record<number, string> = {};

  prompts.forEach((prompt, index) => {
    // Match pattern: <b>emoji question</b><br/>answer<br/><br/>
    const escapedQuestion = prompt.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `<b>${prompt.emoji}\\s*${escapedQuestion}</b><br/>([\\s\\S]*?)(?:<br/><br/>|$)`,
      'i'
    );
    const match = content.match(regex);
    if (match && match[1]) {
      answers[index] = match[1].trim();
    }
  });

  return answers;
};

export default function CreateNoteScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('notes');
  const { t: tCommon } = useTranslation('common');
  const { userId } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // Get enabled prompts from store (select prompts array directly, filter with useMemo to avoid infinite loop)
  const prompts = usePromptsStore((state) => state.prompts);
  const enabledPrompts = useMemo(() => prompts.filter((p) => p.isEnabled), [prompts]);

  // Get user's theme preference for challenge generation
  const { data: preferences } = useUserPreferences(userId ?? undefined);
  const themeId = (preferences?.theme_id as ThemeId) || 'default';

  // Check if today's note already exists (edit mode)
  const { data: todaysNote, isLoading: isLoadingTodaysNote } = useTodaysNote(userId ?? undefined);
  const isEditMode = !!todaysNote;

  // Draft store
  const { draft, saveDraft, clearDraft } = useDraftStore();

  // Track if we've initialized from existing note
  const [hasInitialized, setHasInitialized] = useState(false);

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saveStage, setSaveStage] = useState<SaveStage>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Initialize answers from existing note or draft
  useEffect(() => {
    if (hasInitialized) return;

    if (todaysNote) {
      // Edit mode: parse existing content
      const parsedAnswers = parseContentToAnswers(todaysNote.content, enabledPrompts);
      setAnswers(parsedAnswers);
      setHasInitialized(true);
      clearDraft(); // Clear any draft since we're editing existing
    } else if (!isLoadingTodaysNote && draft?.answers) {
      // Create mode: restore from draft
      setAnswers(draft.answers);
      setHasInitialized(true);
    } else if (!isLoadingTodaysNote) {
      setHasInitialized(true);
    }
  }, [todaysNote, isLoadingTodaysNote, draft, hasInitialized, clearDraft, enabledPrompts]);

  // Mutations
  const createNoteMutation = useCreateNote(userId ?? undefined);
  const updateNoteMutation = useUpdateNote();
  const createChallengesMutation = useCreateChallenges(userId ?? undefined);
  const markChallengesGeneratedMutation = useMarkChallengesGenerated();

  // Autosave draft with debounce (only in create mode)
  useEffect(() => {
    if (isEditMode) return; // Don't save drafts when editing existing note

    const hasContent = Object.values(answers).some((a) => a.trim());
    if (!hasContent) return;

    const timer = setTimeout(() => {
      saveDraft(answers);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 500);

    return () => clearTimeout(timer);
  }, [answers, saveDraft, isEditMode]);

  // Handle answer change
  const handleAnswerChange = useCallback((index: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [index]: text }));
  }, []);

  // Button scale animation values
  const nextButtonScale = useSharedValue(1);
  const backButtonScale = useSharedValue(1);

  // Navigate to prompt with haptic feedback
  const goToPrompt = useCallback(
    (index: number, direction?: 'next' | 'back') => {
      if (index < 0 || index >= enabledPrompts.length) return;

      Keyboard.dismiss();

      // Haptic feedback based on direction
      if (direction === 'next') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (direction === 'back') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    },
    [enabledPrompts.length]
  );

  // Handle swipe end to sync current index
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / SCREEN_WIDTH);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < enabledPrompts.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex, enabledPrompts.length]
  );

  // Button press animations
  const handleNextPressIn = useCallback(() => {
    nextButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }, [nextButtonScale]);

  const handleNextPressOut = useCallback(() => {
    nextButtonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [nextButtonScale]);

  const handleBackPressIn = useCallback(() => {
    backButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }, [backButtonScale]);

  const handleBackPressOut = useCallback(() => {
    backButtonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [backButtonScale]);

  const nextButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextButtonScale.value }],
  }));

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  // Build HTML content from answers
  const buildContent = () => {
    return enabledPrompts
      .map((prompt, index) => {
        const answer = answers[index]?.trim() || '';
        if (!answer) return '';
        return `<b>${prompt.emoji} ${prompt.question}</b><br/>${answer}<br/><br/>`;
      })
      .filter(Boolean)
      .join('');
  };

  // Handle save
  const handleSave = async () => {
    const content = buildContent();
    if (!content.trim()) {
      Alert.alert(t('create.errors.empty'), t('create.errors.emptyMessage'));
      return;
    }

    // Capture userId at start to detect race conditions
    const currentUserId = userId;
    if (!currentUserId) {
      Alert.alert(tCommon('error'), tCommon('errors.unauthorized'));
      return;
    }

    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaveStage('saving');

    try {
      const title = getFormattedDate(getCurrentLanguage());

      if (isEditMode && todaysNote) {
        // Edit mode: just update the note, no challenge regeneration
        await updateNoteMutation.mutateAsync({
          noteId: todaysNote.id,
          title,
          content,
        });
        setSaveStage('done');
      } else {
        // Create mode: create note and generate challenges
        const newNote = await createNoteMutation.mutateAsync({ title, content });

        setSaveStage('generating');

        let challengesFailed = false;
        try {
          // Pass themeId to generate theme-appropriate challenges
          const challengesJson = await generateChallenges(content, false, themeId);

          const parsedChallenges = JSON.parse(challengesJson).challenges;
          if (!Array.isArray(parsedChallenges) || parsedChallenges.length === 0) {
            throw new Error('Invalid challenges format');
          }

          await createChallengesMutation.mutateAsync({
            noteId: newNote.id,
            challenges: parsedChallenges,
          });
          await markChallengesGeneratedMutation.mutateAsync(newNote.id);
        } catch (challengeError) {
          // Challenge generation failed, but note was saved
          logger.error('Challenge generation failed:', challengeError);
          challengesFailed = true;
        }

        clearDraft();
        setSaveStage('done');

        // Show warning after a brief delay so the done animation plays first
        if (challengesFailed) {
          setTimeout(() => {
            Alert.alert(
              tCommon('warning'),
              t('create.errors.challengesFailed')
            );
          }, 500);
        }
      }
    } catch {
      setSaveStage(null);
      Alert.alert(tCommon('error'), t('create.errors.saveFailed'));
    }
  };

  // Handle done after save
  const handleSaveDone = () => {
    setSaveStage(null);
    router.replace('/(tabs)');
  };

  // Handle back
  const handleBack = () => {
    if (isEditMode) {
      // In edit mode, just go back (changes are not auto-saved as drafts)
      router.back();
      return;
    }

    const hasContent = Object.values(answers).some((a) => a.trim());
    if (hasContent) {
      Alert.alert(t('create.discardDraft.title'), t('create.discardDraft.message'), [
        { text: tCommon('buttons.keepEditing'), style: 'cancel' },
        {
          text: tCommon('buttons.leave'),
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  const isLastPrompt = currentIndex === enabledPrompts.length - 1;
  const isFirstPrompt = currentIndex === 0;

  // Show loading while checking for today's note
  if (isLoadingTodaysNote || !hasInitialized) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          styles.loadingContainer,
          { backgroundColor: theme.background.primary },
        ]}
        edges={['top']}
      >
        <ActivityIndicator size="large" color={theme.brand.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <MaterialIcons name="close" size={24} color={theme.text.primary} />
        </Pressable>

        <PromptProgress total={enabledPrompts.length} current={currentIndex} />

        <View style={styles.headerRight}>
          {draftSaved && (
            <Animated.Text
              entering={FadeIn.duration(200)}
              style={[styles.draftSaved, { color: theme.text.tertiary }]}
            >
              {t('create.saved')}
            </Animated.Text>
          )}
        </View>
      </Animated.View>

      {/* Prompts carousel with swipe support */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={enabledPrompts}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          renderItem={({ item, index }) => (
            <GuidedPrompt
              emoji={item.emoji}
              question={item.question}
              value={answers[index] || ''}
              onChangeText={(text) => handleAnswerChange(index, text)}
              index={index}
              isActive={index === currentIndex}
            />
          )}
        />
      </KeyboardAvoidingView>

      {/* Navigation buttons */}
      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.navigation}>
        {!isFirstPrompt && (
          <Animated.View style={backButtonStyle}>
            <Pressable
              style={[styles.navButton, { borderColor: theme.border.primary }]}
              onPress={() => goToPrompt(currentIndex - 1, 'back')}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.text.primary} />
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.navSpacer} />

        {isLastPrompt ? (
          <Animated.View style={[styles.saveButtonContainer, nextButtonStyle]}>
            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.brand.primary }]}
              onPress={handleSave}
              onPressIn={handleNextPressIn}
              onPressOut={handleNextPressOut}
            >
              <Text style={styles.saveButtonText}>
                {isEditMode ? t('create.update') : t('create.done')}
              </Text>
              <MaterialIcons name="check" size={20} color="#fff" />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View style={nextButtonStyle}>
            <Pressable
              style={[styles.nextButton, { backgroundColor: theme.brand.primary }]}
              onPress={() => goToPrompt(currentIndex + 1, 'next')}
              onPressIn={handleNextPressIn}
              onPressOut={handleNextPressOut}
            >
              <Text style={styles.nextButtonText}>{t('create.next')}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>

      {/* Skip indicator */}
      {!isLastPrompt && (
        <Pressable
          style={styles.skipContainer}
          onPress={() => goToPrompt(currentIndex + 1, 'next')}
        >
          <Text style={[styles.skipText, { color: theme.text.tertiary }]}>
            {t('create.swipeToSkip')}
          </Text>
        </Pressable>
      )}

      {/* Save progress modal */}
      <SaveProgressModal visible={saveStage !== null} stage={saveStage} onDone={handleSaveDone} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  headerRight: {
    width: 50,
    alignItems: 'flex-end',
  },
  draftSaved: {
    ...textStyles.caption,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    height: 48,
    borderRadius: radius.lg,
    gap: spacing[2],
  },
  nextButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  saveButtonContainer: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    height: 48,
    borderRadius: radius.lg,
    gap: spacing[2],
  },
  saveButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  skipContainer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  skipText: {
    ...textStyles.bodySmall,
  },
});
